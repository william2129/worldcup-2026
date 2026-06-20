// ManualClaudeCodeProvider:
// 预测内容由 Claude Code(我)在开发会话中直接写入 data/predictions.json
// 这是一种"零运行时成本"的方案 - 比赛结束后用户在会话里要求重新预测,我会重新生成 JSON。
//
// 数据文件结构:
//   data/match-predictions.json  - { [matchId]: PredictionData }
//   data/team-analysis.json      - { [teamId]: TeamAnalysisData }

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { MatchPrediction, TeamAnalysis } from '../types';
import type { PredictionProvider, MatchPredictionInput } from './provider';

const DATA_DIR = path.join(process.cwd(), 'data');
const MATCH_PRED_PATH = path.join(DATA_DIR, 'match-predictions.json');
const TEAM_ANALYSIS_PATH = path.join(DATA_DIR, 'team-analysis.json');

async function readJsonOrEmpty<T>(p: string): Promise<T> {
  try {
    const buf = await readFile(p, 'utf-8');
    return JSON.parse(buf) as T;
  } catch {
    return {} as T;
  }
}

async function writeJson(p: string, data: unknown) {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
}

type MatchPredMap = Record<string, Omit<MatchPrediction, 'matchId'>>;
type TeamAnalysisMap = Record<string, Omit<TeamAnalysis, 'teamId'>>;

export class ManualClaudeCodeProvider implements PredictionProvider {
  name = 'claude-code-manual';

  async generateMatchPredictions(inputs: MatchPredictionInput[]) {
    const cache = await readJsonOrEmpty<MatchPredMap>(MATCH_PRED_PATH);
    const out: Array<{ matchId: string; prediction: Omit<MatchPrediction, 'matchId'> }> = [];
    for (const inp of inputs) {
      const cached = cache[inp.match.id];
      if (cached) {
        out.push({ matchId: inp.match.id, prediction: cached });
      }
    }
    return out;
  }

  async generateTeamAnalysis(teamId: string) {
    const cache = await readJsonOrEmpty<TeamAnalysisMap>(TEAM_ANALYSIS_PATH);
    const cached = cache[teamId];
    if (!cached) {
      throw new Error(`球队 ${teamId} 的分析尚未生成。请在 Claude Code 中要求"重新生成预测"`);
    }
    return cached;
  }
}

/** Claude Code 会话中调用的辅助方法 - 直接写入预测数据 */
export async function upsertManualMatchPrediction(
  matchId: string,
  pred: Omit<MatchPrediction, 'matchId'>,
) {
  const cache = await readJsonOrEmpty<MatchPredMap>(MATCH_PRED_PATH);
  cache[matchId] = pred;
  await writeJson(MATCH_PRED_PATH, cache);
}

export async function upsertManualTeamAnalysis(
  teamId: string,
  analysis: Omit<TeamAnalysis, 'teamId'>,
) {
  const cache = await readJsonOrEmpty<TeamAnalysisMap>(TEAM_ANALYSIS_PATH);
  cache[teamId] = analysis;
  await writeJson(TEAM_ANALYSIS_PATH, cache);
}
