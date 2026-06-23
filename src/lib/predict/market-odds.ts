// The Odds API 客户端 + 市场共识赔率计算
//
// 流程:
// 1. 从 The Odds API 拉取多家博彩公司的 H2H 赔率
// 2. 把赔率转成隐含概率 (1 / decimal_odds)
// 3. 去除 overround (庄家利润),归一化得到"真实"市场概率
// 4. 多家公司平均得到"市场共识"
//
// 文档: https://the-odds-api.com/liveapi/guides/v4/

import type { MarketConsensus } from '../types';

const BASE_URL = 'https://api.the-odds-api.com/v4';
const SPORT_KEY = 'soccer_fifa_world_cup';

interface OddsApiOutcome {
  name: string;
  price: number;
}

interface OddsApiMarket {
  key: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  markets: OddsApiMarket[];
}

export interface OddsApiEvent {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: OddsApiBookmaker[];
}

export async function fetchWorldCupOdds(apiKey: string): Promise<OddsApiEvent[]> {
  const url = `${BASE_URL}/sports/${SPORT_KEY}/odds?apiKey=${apiKey}&regions=eu,uk&markets=h2h&oddsFormat=decimal`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`The Odds API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<OddsApiEvent[]>;
}

/** 一家博彩公司的 H2H 赔率 → 去 overround 的真实概率 */
function impliedProb(outcomes: OddsApiOutcome[], homeName: string, awayName: string) {
  let homeOdds = 0, drawOdds = 0, awayOdds = 0;
  for (const o of outcomes) {
    if (o.name === homeName) homeOdds = o.price;
    else if (o.name === awayName) awayOdds = o.price;
    else drawOdds = o.price; // "Draw"
  }
  if (!homeOdds || !drawOdds || !awayOdds) return null;
  const rawHome = 1 / homeOdds;
  const rawDraw = 1 / drawOdds;
  const rawAway = 1 / awayOdds;
  const overround = rawHome + rawDraw + rawAway;
  return {
    home: rawHome / overround,
    draw: rawDraw / overround,
    away: rawAway / overround,
  };
}

/** 多家公司平均得"市场共识" */
export function aggregateMarketConsensus(event: OddsApiEvent): MarketConsensus | null {
  const probs: Array<{ home: number; draw: number; away: number }> = [];
  const sources: string[] = [];
  for (const bm of event.bookmakers) {
    const h2h = bm.markets.find((m) => m.key === 'h2h');
    if (!h2h) continue;
    const p = impliedProb(h2h.outcomes, event.home_team, event.away_team);
    if (p) {
      probs.push(p);
      sources.push(bm.title);
    }
  }
  if (probs.length === 0) return null;
  const avg = (k: 'home' | 'draw' | 'away') =>
    probs.reduce((s, p) => s + p[k], 0) / probs.length;
  return {
    homeWinProb: avg('home'),
    drawProb: avg('draw'),
    awayWinProb: avg('away'),
    bookmakerCount: probs.length,
    bookmakers: sources,
    fetchedAt: new Date().toISOString(),
  };
}
