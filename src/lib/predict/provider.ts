// AI 预测提供者接口 - 可插拔
// 当前实现:ManualClaudeCodeProvider(从 JSON 文件加载,由 Claude Code 开发会话生成)
// 后续可加:DeepSeekProvider / AnthropicProvider

import type { MatchWithTeams, MatchPrediction, TeamAnalysis } from '../types';

export interface MatchPredictionInput {
  match: MatchWithTeams;
  context: {
    /** 该队近期已完成比赛(已发生的事实) */
    homeRecentResults: Array<{ opponent: string; score: string; result: 'W' | 'D' | 'L' }>;
    awayRecentResults: Array<{ opponent: string; score: string; result: 'W' | 'D' | 'L' }>;
    /** 头对头历史 */
    h2h?: Array<{ date: string; score: string }>;
  };
}

export interface PredictionProvider {
  name: string;

  /** 批量生成所有未来场次预测(更便宜) */
  generateMatchPredictions(
    inputs: MatchPredictionInput[],
  ): Promise<Array<{ matchId: string; prediction: Omit<MatchPrediction, 'matchId'> }>>;

  /** 生成或更新某队的整体分析 */
  generateTeamAnalysis(
    teamId: string,
    context: { name: string; fifaRank?: number; recentForm?: string },
  ): Promise<Omit<TeamAnalysis, 'teamId'>>;
}
