// football-data.org API 客户端
// 文档: https://www.football-data.org/documentation/quickstart
// 世界杯 competition code = 'WC'

const BASE_URL = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';

export interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FDScore {
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
  winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
}

export interface FDMatch {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';
  stage: string;
  group?: string | null;
  matchday: number | null;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
  venue?: string;
}

export interface FDMatchesResponse {
  count: number;
  matches: FDMatch[];
}

async function fdFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY 未配置');

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': apiKey },
    // 服务端拉取,缓存交给 Next.js 的 fetch 缓存系统
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data.org ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export const footballData = {
  /** 获取世界杯全部比赛 */
  async listMatches(): Promise<FDMatchesResponse> {
    return fdFetch<FDMatchesResponse>(`/competitions/${COMPETITION}/matches`);
  },

  /** 获取世界杯所有球队 */
  async listTeams(): Promise<{ teams: FDTeam[] }> {
    return fdFetch<{ teams: FDTeam[] }>(`/competitions/${COMPETITION}/teams`);
  },

  /** 获取小组赛积分榜(如果赛事支持) */
  async standings(): Promise<unknown> {
    return fdFetch<unknown>(`/competitions/${COMPETITION}/standings`);
  },
};

/** football-data 状态映射到内部状态 */
export function mapStatus(s: FDMatch['status']): import('./types').MatchStatus {
  switch (s) {
    case 'IN_PLAY':
      return 'LIVE';
    case 'PAUSED':
      return 'PAUSED';
    case 'FINISHED':
      return 'FINISHED';
    case 'POSTPONED':
      return 'POSTPONED';
    case 'CANCELLED':
    case 'SUSPENDED':
      return 'CANCELLED';
    case 'SCHEDULED':
    case 'TIMED':
    default:
      return 'SCHEDULED';
  }
}
