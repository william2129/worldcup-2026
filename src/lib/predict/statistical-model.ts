// 统计预测模型 - Dixon-Coles (1997) 修正的 Poisson 模型
//
// 算法:
// 1. 根据 Elo 差异计算每队的预期进球率 λ_h、λ_a
// 2. 计算 7×7 网格内每个比分的联合概率 P(X=i, Y=j) = Poisson(i;λ_h) × Poisson(j;λ_a)
// 3. 对低比分(0-0、1-0、0-1、1-1)应用 Dixon-Coles 修正 τ(i,j,λ_h,λ_a,ρ)
// 4. 归一化后输出胜平负概率和最可能比分
//
// 相比纯 Poisson 的提升:0-0/1-1 概率更接近真实(高 15-30%),1-0/0-1 略降
import type { StatisticalPrediction as BaseStatPred } from '../types';

const MAX_GOALS = 6;          // 网格上限(更高的比分概率忽略不计)
const BASE_GOAL_RATE = 1.45;  // 国家队比赛平均每队进球率
const ELO_GOAL_FACTOR = 0.32; // Elo 差 100 → 进球率 × e^0.08
const ELO_SCALE = 400;
const DC_RHO = -0.10;         // Dixon-Coles 相关性参数(国际足球通常 -0.05 ~ -0.15)

export type StatisticalPrediction = BaseStatPred;

function poissonPmf(k: number, lambda: number): number {
  // P(X = k) = e^(-λ) · λ^k / k!
  if (k < 0) return 0;
  let logResult = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logResult -= Math.log(i);
  return Math.exp(logResult);
}

/** Dixon-Coles 低比分相关性修正 τ(x, y, λ_h, λ_a, ρ) */
function tau(x: number, y: number, lambdaH: number, lambdaA: number, rho: number): number {
  if (x === 0 && y === 0) return 1 - lambdaH * lambdaA * rho;
  if (x === 0 && y === 1) return 1 + lambdaH * rho;
  if (x === 1 && y === 0) return 1 + lambdaA * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

export function predictMatch(
  homeElo: number,
  awayElo: number,
  drawBoost = 0,
): StatisticalPrediction {
  // Elo 差异 → 进球率
  const eloDiff = (homeElo - awayElo) / ELO_SCALE;
  const lambdaH = BASE_GOAL_RATE * Math.exp(eloDiff * ELO_GOAL_FACTOR);
  const lambdaA = BASE_GOAL_RATE * Math.exp(-eloDiff * ELO_GOAL_FACTOR);

  // 计算 7×7 网格,应用 Dixon-Coles 修正
  const probs: number[][] = [];
  let totalMass = 0;
  for (let i = 0; i <= MAX_GOALS; i++) {
    probs[i] = [];
    for (let j = 0; j <= MAX_GOALS; j++) {
      const pBase = poissonPmf(i, lambdaH) * poissonPmf(j, lambdaA);
      const adj = tau(i, j, lambdaH, lambdaA, DC_RHO);
      probs[i][j] = pBase * adj;
      totalMass += probs[i][j];
    }
  }

  // 归一化(因为 τ 调整 + 截断高比分,需要重新归一化到 1)
  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      probs[i][j] /= totalMass;
    }
  }

  // 计算胜平负
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      if (i > j) homeWin += probs[i][j];
      else if (i < j) awayWin += probs[i][j];
      else draw += probs[i][j];
    }
  }

  // 末轮平局倾向加成:从非平局转移部分概率到平局
  if (drawBoost > 0 && homeWin + awayWin > 0) {
    const transfer = drawBoost * (homeWin + awayWin);
    const homeRatio = homeWin / (homeWin + awayWin);
    homeWin -= transfer * homeRatio;
    awayWin -= transfer * (1 - homeRatio);
    draw += transfer;
  }

  // Top 3 比分
  const flat: { home: number; away: number; prob: number }[] = [];
  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      flat.push({ home: i, away: j, prob: probs[i][j] });
    }
  }
  flat.sort((a, b) => b.prob - a.prob);
  const topScores = flat.slice(0, 3);

  return {
    homeWinProb: homeWin,
    drawProb: draw,
    awayWinProb: awayWin,
    expectedHomeGoals: lambdaH,
    expectedAwayGoals: lambdaA,
    topScores,
    mostLikelyHome: topScores[0].home,
    mostLikelyAway: topScores[0].away,
    // 解析法精度等价于 (MAX_GOALS+1)^2 = 49 个比分点的精确计算
    simulations: (MAX_GOALS + 1) * (MAX_GOALS + 1),
  };
}

/** 评估 AI 预测和统计模型的一致性 */
export function modelAgreement(
  aiPrediction: { homeScore: number; awayScore: number; homeWinProb: number; drawProb: number; awayWinProb: number },
  statModel: StatisticalPrediction,
): { agreement: 'high' | 'medium' | 'low'; reason: string } {
  const aiWinner = aiPrediction.homeScore > aiPrediction.awayScore
    ? 'h'
    : aiPrediction.homeScore < aiPrediction.awayScore
    ? 'a'
    : 'd';
  const statWinner =
    statModel.homeWinProb > statModel.drawProb && statModel.homeWinProb > statModel.awayWinProb
      ? 'h'
      : statModel.awayWinProb > statModel.drawProb
      ? 'a'
      : 'd';

  if (aiWinner === statWinner) {
    const scoreDiff =
      Math.abs(aiPrediction.homeScore - statModel.mostLikelyHome) +
      Math.abs(aiPrediction.awayScore - statModel.mostLikelyAway);
    if (scoreDiff <= 1) {
      return { agreement: 'high', reason: '两个模型一致,比分接近' };
    }
    return { agreement: 'medium', reason: '赢家方向一致但比分有分歧' };
  }
  return { agreement: 'low', reason: '两个模型对赢家方向有分歧' };
}
