// 数据访问层。优先从 data/*.json 读取(由 build-from-raw 生成);
// 找不到时回退到 src/lib/mock.ts。
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FIXTURES_MOCK, STANDINGS_MOCK, TEAMS_MOCK, TEAM_ANALYSIS_MOCK } from './mock';
import type { MatchWithTeams, GroupStanding, Team, TeamAnalysis, MatchPrediction, Match, AnalysisBlock } from './types';

interface RawTeam extends Team {
  tla: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');

let _teamsCache: Team[] | null = null;
let _matchesCache: Match[] | null = null;
let _standingsCache: Record<string, GroupStanding[]> | null = null;
let _predictionsCache: Record<string, Omit<MatchPrediction, 'matchId'>> | null = null;
let _analysisCache: Record<string, Omit<TeamAnalysis, 'teamId'>> | null = null;
let _matchAnalysisDetailCache: Record<string, AnalysisBlock[]> | null = null;
let _teamAnalysisDetailCache: Record<string, AnalysisBlock[]> | null = null;

async function loadDetailMap(file: string): Promise<Record<string, AnalysisBlock[]>> {
  const fromJson = await readJsonOrNull<Record<string, AnalysisBlock[] | string>>(file);
  if (!fromJson) return {};
  const out: Record<string, AnalysisBlock[]> = {};
  for (const [k, v] of Object.entries(fromJson)) {
    if (k.startsWith('_')) continue;
    if (Array.isArray(v)) out[k] = v as AnalysisBlock[];
  }
  return out;
}

async function loadMatchAnalysisDetails(): Promise<Record<string, AnalysisBlock[]>> {
  if (_matchAnalysisDetailCache) return _matchAnalysisDetailCache;
  _matchAnalysisDetailCache = await loadDetailMap('match-analysis-detail.json');
  return _matchAnalysisDetailCache;
}

async function loadTeamAnalysisDetails(): Promise<Record<string, AnalysisBlock[]>> {
  if (_teamAnalysisDetailCache) return _teamAnalysisDetailCache;
  _teamAnalysisDetailCache = await loadDetailMap('team-analysis-detail.json');
  return _teamAnalysisDetailCache;
}

async function readJsonOrNull<T>(file: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function loadTeams(): Promise<Team[]> {
  if (_teamsCache) return _teamsCache;
  const fromJson = await readJsonOrNull<RawTeam[]>('teams.json');
  _teamsCache = fromJson && fromJson.length > 0 ? fromJson : TEAMS_MOCK;
  return _teamsCache;
}

async function loadMatches(): Promise<Match[]> {
  if (_matchesCache) return _matchesCache;
  const fromJson = await readJsonOrNull<Match[]>('matches.json');
  if (fromJson && fromJson.length > 0) {
    _matchesCache = fromJson;
  } else {
    _matchesCache = FIXTURES_MOCK.map(({ homeTeam: _ht, awayTeam: _at, prediction: _p, ...rest }) => rest);
  }
  return _matchesCache;
}

async function loadStandings(): Promise<Record<string, GroupStanding[]>> {
  if (_standingsCache) return _standingsCache;
  const fromJson = await readJsonOrNull<Record<string, GroupStanding[]>>('standings.json');
  _standingsCache = fromJson ?? STANDINGS_MOCK;
  return _standingsCache;
}

async function loadPredictions(): Promise<Record<string, Omit<MatchPrediction, 'matchId'>>> {
  if (_predictionsCache) return _predictionsCache;
  const fromJson = await readJsonOrNull<Record<string, Omit<MatchPrediction, 'matchId'> | string>>('match-predictions.json');
  if (!fromJson) {
    _predictionsCache = {};
    return _predictionsCache;
  }
  // 过滤掉 _README / _generatedAt 这类元字段
  const clean: Record<string, Omit<MatchPrediction, 'matchId'>> = {};
  for (const [k, v] of Object.entries(fromJson)) {
    if (k.startsWith('_')) continue;
    if (typeof v === 'object' && v !== null) clean[k] = v as Omit<MatchPrediction, 'matchId'>;
  }
  _predictionsCache = clean;
  return _predictionsCache;
}

async function loadAnalysis(): Promise<Record<string, Omit<TeamAnalysis, 'teamId'>>> {
  if (_analysisCache) return _analysisCache;
  const fromJson = await readJsonOrNull<Record<string, Omit<TeamAnalysis, 'teamId'> | string>>('team-analysis.json');
  if (!fromJson) {
    _analysisCache = Object.fromEntries(
      Object.entries(TEAM_ANALYSIS_MOCK).map(([k, v]) => {
        const { teamId: _t, ...rest } = v;
        return [k, rest];
      }),
    );
    return _analysisCache;
  }
  const clean: Record<string, Omit<TeamAnalysis, 'teamId'>> = {};
  for (const [k, v] of Object.entries(fromJson)) {
    if (k.startsWith('_')) continue;
    if (typeof v === 'object' && v !== null) clean[k] = v as Omit<TeamAnalysis, 'teamId'>;
  }
  _analysisCache = clean;
  return _analysisCache;
}

async function attach(
  m: Match,
  teamMap: Map<string, Team>,
  preds: Record<string, Omit<MatchPrediction, 'matchId'>>,
  details: Record<string, AnalysisBlock[]>,
): Promise<MatchWithTeams | null> {
  const ht = teamMap.get(m.homeTeamId);
  const at = teamMap.get(m.awayTeamId);
  if (!ht || !at) return null;
  const pred = preds[m.id];
  const detail = details[m.id];
  return {
    ...m,
    homeTeam: ht,
    awayTeam: at,
    prediction: pred
      ? { matchId: m.id, ...pred, analysisDetail: detail ?? pred.analysisDetail }
      : undefined,
  };
}

export async function getAllFixtures(): Promise<MatchWithTeams[]> {
  const [teams, matches, preds, details] = await Promise.all([
    loadTeams(), loadMatches(), loadPredictions(), loadMatchAnalysisDetails(),
  ]);
  const map = new Map(teams.map((t) => [t.id, t]));
  const out: MatchWithTeams[] = [];
  for (const m of matches) {
    const x = await attach(m, map, preds, details);
    if (x) out.push(x);
  }
  return out;
}

export async function getFixtureById(id: string): Promise<MatchWithTeams | null> {
  const all = await getAllFixtures();
  return all.find((m) => m.id === id) ?? null;
}

export async function getTeams(): Promise<Team[]> {
  return loadTeams();
}

export async function getTeamById(id: string): Promise<Team | null> {
  const teams = await loadTeams();
  return teams.find((t) => t.id === id) ?? null;
}

export async function getTeamAnalysis(id: string): Promise<TeamAnalysis | null> {
  const [a, details] = await Promise.all([loadAnalysis(), loadTeamAnalysisDetails()]);
  if (!a[id]) return null;
  return { teamId: id, ...a[id], analysisDetail: details[id] ?? a[id].analysisDetail };
}

export async function getStandings(): Promise<Record<string, GroupStanding[]>> {
  return loadStandings();
}

export async function getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]> {
  const all = await getAllFixtures();
  return all.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
}

export async function getFixturesByGroup(groupId: string): Promise<MatchWithTeams[]> {
  const all = await getAllFixtures();
  return all.filter((m) => m.groupId === groupId);
}

export function groupFixturesByDate(matches: MatchWithTeams[]): { date: string; matches: MatchWithTeams[] }[] {
  const map = new Map<string, MatchWithTeams[]>();
  for (const m of matches) {
    const d = m.utcDate.slice(0, 10);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(m);
  }
  const dates = Array.from(map.keys()).sort();
  return dates.map((date) => ({
    date,
    matches: map.get(date)!.sort((a, b) => a.utcDate.localeCompare(b.utcDate)),
  }));
}
