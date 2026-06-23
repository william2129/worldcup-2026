// 对比 Dixon-Coles vs 纯 Poisson 在相同输入下的输出差异
import { predictMatch } from '../src/lib/predict/statistical-model';

const cases = [
  { name: 'BRA vs MAR (势均力敌,实际 1-1)', h: 2045, a: 1875 },
  { name: 'JPN vs SWE (势均力敌)',         h: 1800, a: 1755 },
  { name: 'ARG vs FRA (顶级互殴)',         h: 2143, a: 2125 },
  { name: 'ARG vs CAN (强对中)',           h: 2143, a: 1700 },
  { name: 'ARG vs QAT (强对弱)',           h: 2143, a: 1450 },
  { name: 'ESP vs CPV (实际 0-0)',         h: 2090, a: 1480 },
  { name: 'BEL vs EGY (实际 1-1)',         h: 1965, a: 1675 },
];

for (const c of cases) {
  const p = predictMatch(c.h, c.a);
  const fmt = (n: number) => `${Math.round(n * 100)}%`;
  console.log(`\n${c.name}`);
  console.log(`  概率: 主胜 ${fmt(p.homeWinProb)} | 平 ${fmt(p.drawProb)} | 客胜 ${fmt(p.awayWinProb)}`);
  console.log(`  λ: ${p.expectedHomeGoals.toFixed(2)} vs ${p.expectedAwayGoals.toFixed(2)}`);
  console.log(`  Top3: ${p.topScores.map(s => `${s.home}-${s.away}(${fmt(s.prob)})`).join('  ')}`);
}
