// 全局领域类型定义

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type Stage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Team {
  id: string;            // 内部 ID
  externalId?: number;   // football-data.org 的 ID
  name: string;          // 中文名
  nameEn: string;        // 英文名
  countryCode: string;   // ISO 3166-1 alpha-2 (用于国旗)
  groupId?: string;      // 所属小组 A-L
  crest?: string;        // 队徽URL
  fifaRank?: number;
}

export interface Match {
  id: string;
  externalId?: number;
  stage: Stage;
  groupId?: string;
  utcDate: string;       // ISO
  status: MatchStatus;
  matchday?: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  // 加时/点球可后扩
  venue?: string;
}

export type AnalysisIcon =
  | 'sword' | 'shield' | 'star' | 'flame' | 'lightbulb' | 'eye'
  | 'history' | 'crown' | 'target' | 'flag' | 'zap' | 'crystal';

export interface AnalysisBlock {
  icon: AnalysisIcon;
  title: string;
  body: string;
}

export interface MatchPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homeWinProb: number;   // 0-1
  drawProb: number;
  awayWinProb: number;
  confidence: number;    // 0-1
  reasoning: string;     // AI 给出的中文分析(简短摘要)
  generatedAt: string;   // ISO
  generatedBy: string;   // 'claude-opus-4-7' / 'mock'
  /** 详细分析,分段展示 */
  analysisDetail?: AnalysisBlock[];
}

export interface TeamAnalysis {
  teamId: string;
  strengths: string[];
  weaknesses: string[];
  keyPlayers: string[];
  championProb: number;  // 0-1
  knockoutProb: number;  // 0-1
  summary: string;
  generatedAt: string;
  generatedBy?: string;
  /** 详细分析,分段展示 */
  analysisDetail?: AnalysisBlock[];
}

export interface GroupStanding {
  teamId: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  rank: number;          // 当前排名
  qualifyProb: number;   // 出线概率 0-1
}

// H2H 历史交锋
export interface HeadToHead {
  overall: string;          // 如 "5W-2D-3L"(从主队角度)
  recentScores: string[];   // 最近几次比分(字符串描述)
  note: string;
}

// 统计预测(Elo + Poisson 蒙特卡洛 / Dixon-Coles)
export interface StatisticalPrediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  topScores: { home: number; away: number; prob: number }[];
  mostLikelyHome: number;
  mostLikelyAway: number;
  simulations: number;
}

// 市场共识(多家博彩公司隐含概率平均)
export interface MarketConsensus {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  bookmakerCount: number;
  bookmakers: string[];
  fetchedAt: string;
}

// 集成预测(三模型加权融合)
export interface EnsemblePrediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  /** 各模型的贡献权重 */
  weights: { ai: number; statistical: number; market: number };
  /** 共识比分 */
  consensusHome: number;
  consensusAway: number;
}

// 模型一致性
export type ModelAgreement = 'high' | 'medium' | 'low';

// 视图层组合
export interface MatchWithTeams extends Match {
  homeTeam: Team;
  awayTeam: Team;
  prediction?: MatchPrediction;
  statisticalPrediction?: StatisticalPrediction;
  marketConsensus?: MarketConsensus;
  ensemble?: EnsemblePrediction;
  h2h?: HeadToHead;
  modelAgreement?: ModelAgreement;
}
