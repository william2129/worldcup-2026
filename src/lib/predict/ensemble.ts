// 三模型加权融合
// AI 判断(战意/状态) + 统计模型(Dixon-Coles) + 市场共识(博彩盘口)
import type { EnsemblePrediction, MarketConsensus, MatchPrediction, StatisticalPrediction } from '../types';

// 默认权重(可调)
const W_AI = 0.30;
const W_STAT = 0.30;
const W_MARKET = 0.40;  // 市场共识权重最高(数十万人的群体智慧)

export function ensemblePredict(
  ai: Pick<MatchPrediction, 'homeWinProb' | 'drawProb' | 'awayWinProb' | 'homeScore' | 'awayScore'> | undefined,
  stat: StatisticalPrediction | undefined,
  market: MarketConsensus | undefined,
): EnsemblePrediction | undefined {
  // 至少要有 2 个模型
  const sources = [ai, stat, market].filter((x): x is NonNullable<typeof x> => !!x);
  if (sources.length < 2) return undefined;

  let wAI = ai ? W_AI : 0;
  let wStat = stat ? W_STAT : 0;
  let wMarket = market ? W_MARKET : 0;
  // 归一化权重
  const sumW = wAI + wStat + wMarket;
  if (sumW <= 0) return undefined;
  wAI /= sumW;
  wStat /= sumW;
  wMarket /= sumW;

  const home =
    (ai?.homeWinProb ?? 0) * wAI +
    (stat?.homeWinProb ?? 0) * wStat +
    (market?.homeWinProb ?? 0) * wMarket;
  const draw =
    (ai?.drawProb ?? 0) * wAI +
    (stat?.drawProb ?? 0) * wStat +
    (market?.drawProb ?? 0) * wMarket;
  const away =
    (ai?.awayWinProb ?? 0) * wAI +
    (stat?.awayWinProb ?? 0) * wStat +
    (market?.awayWinProb ?? 0) * wMarket;

  // 共识比分:AI 比分 + 统计模型比分 加权平均(市场没比分,不参与)
  let consensusHome: number;
  let consensusAway: number;
  if (ai && stat) {
    consensusHome = Math.round((ai.homeScore * 0.5 + stat.mostLikelyHome * 0.5));
    consensusAway = Math.round((ai.awayScore * 0.5 + stat.mostLikelyAway * 0.5));
  } else if (ai) {
    consensusHome = ai.homeScore;
    consensusAway = ai.awayScore;
  } else if (stat) {
    consensusHome = stat.mostLikelyHome;
    consensusAway = stat.mostLikelyAway;
  } else {
    consensusHome = 1;
    consensusAway = 1;
  }

  return {
    homeWinProb: home,
    drawProb: draw,
    awayWinProb: away,
    weights: { ai: wAI, statistical: wStat, market: wMarket },
    consensusHome,
    consensusAway,
  };
}
