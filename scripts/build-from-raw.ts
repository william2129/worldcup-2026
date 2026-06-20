// 把 data/raw/*.json (football-data.org 原始格式)
// 转换为 src 端可直接消费的格式,写入 data/{teams,matches,standings}.json
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { TEAM_I18N, lookupTeamI18n } from '../src/lib/team-i18n';

const RAW = path.join(process.cwd(), 'data', 'raw');
const OUT = path.join(process.cwd(), 'data');

interface FDTeam {
  id: number;
  name: string;
  shortName?: string;
  tla: string;
  crest?: string;
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: { fullTime: { home: number | null; away: number | null } };
}

const STATUS_MAP: Record<string, string> = {
  IN_PLAY: 'LIVE',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'CANCELLED',
  SCHEDULED: 'SCHEDULED',
  TIMED: 'SCHEDULED',
};

// 小组名 GROUP_A -> A
const groupShort = (g: string | null) => (g ? g.replace('GROUP_', '') : undefined);

async function main() {
  await mkdir(OUT, { recursive: true });

  const teamsRaw = JSON.parse(await readFile(path.join(RAW, 'teams.json'), 'utf-8'));
  const matchesRaw = JSON.parse(await readFile(path.join(RAW, 'matches.json'), 'utf-8'));
  const standingsRaw = JSON.parse(await readFile(path.join(RAW, 'standings.json'), 'utf-8'));

  // 先建 external_id -> teamRecord(含 group 推断)
  const tlaToTeamId: Record<number, string> = {};
  const teamGroupMap: Record<string, string> = {};

  // 从 standings 里推断每队所属小组
  for (const s of standingsRaw.standings) {
    const groupName = (s.group as string).replace('Group ', ''); // "Group A" -> "A"
    for (const row of s.table) {
      teamGroupMap[row.team.tla] = groupName;
    }
  }

  const teams = teamsRaw.teams.map((t: FDTeam) => {
    const i18n = lookupTeamI18n(t.tla, t.shortName || t.name);
    const id = t.tla.toLowerCase();
    tlaToTeamId[t.id] = id;
    return {
      id,
      externalId: t.id,
      tla: t.tla,
      name: i18n.name,
      nameEn: t.name,
      countryCode: i18n.countryCode,
      groupId: teamGroupMap[t.tla],
      crest: t.crest,
    };
  });

  await writeFile(path.join(OUT, 'teams.json'), JSON.stringify(teams, null, 2), 'utf-8');
  console.log(`teams.json 写入 ${teams.length} 支球队`);

  const matches = matchesRaw.matches.map((m: FDMatch) => {
    const homeId = tlaToTeamId[m.homeTeam.id] ?? m.homeTeam.tla?.toLowerCase();
    const awayId = tlaToTeamId[m.awayTeam.id] ?? m.awayTeam.tla?.toLowerCase();
    return {
      id: `m_${m.id}`,
      externalId: m.id,
      stage: m.stage,
      groupId: groupShort(m.group),
      utcDate: m.utcDate,
      status: STATUS_MAP[m.status] ?? 'SCHEDULED',
      matchday: m.matchday,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
    };
  });

  await writeFile(path.join(OUT, 'matches.json'), JSON.stringify(matches, null, 2), 'utf-8');
  console.log(`matches.json 写入 ${matches.length} 场比赛`);

  // standings 转换 - 按内部 teamId 索引
  const standings: Record<string, Array<Record<string, unknown>>> = {};
  for (const s of standingsRaw.standings) {
    const gid = (s.group as string).replace('Group ', '');
    standings[gid] = s.table.map((row: {
      position: number;
      team: { tla: string };
      playedGames: number;
      won: number;
      draw: number;
      lost: number;
      points: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
    }) => ({
      teamId: row.team.tla.toLowerCase(),
      played: row.playedGames,
      win: row.won,
      draw: row.draw,
      loss: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDiff: row.goalDifference,
      points: row.points,
      rank: row.position,
      // 出线率由 AI 预测模块单独提供;这里先用排名给出粗略默认值
      qualifyProb: row.position <= 2 ? 0.85 - (row.position - 1) * 0.15 : 0.45 - (row.position - 3) * 0.2,
    }));
  }
  await writeFile(path.join(OUT, 'standings.json'), JSON.stringify(standings, null, 2), 'utf-8');
  console.log(`standings.json 写入 ${Object.keys(standings).length} 个小组`);

  // 提示未在 TEAM_I18N 表里的球队
  const missing = teams.filter((t: { tla: string }) => !TEAM_I18N[t.tla]);
  if (missing.length > 0) {
    console.warn(`警告: ${missing.length} 支球队没有中文名映射:`, missing.map((t: { tla: string }) => t.tla));
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
