import { predictMatch } from '../src/lib/predict/statistical-model';

const tests = [
  { name: 'ARG vs FRA(顶级强强)', home: 2143, away: 2125 },
  { name: 'ARG vs CAN(强对中)', home: 2143, away: 1700 },
  { name: 'ARG vs QAT(强对弱)', home: 2143, away: 1450 },
  { name: 'BRA vs MAR(强对中,真实开局结果是 1-1)', home: 2045, away: 1875 },
  { name: 'JPN vs SWE(势均力敌)', home: 1800, away: 1755 },
  { name: 'PAR vs AUS(均势)', home: 1640, away: 1660 },
  { name: 'ECU vs CUW(强对弱)', home: 1750, away: 1465 },
];

for (const t of tests) {
  const p = predictMatch(t.home, t.away);
  const fmt = (n: number) => `${Math.round(n * 100)}%`;
  console.log(`\n${t.name}`);
  console.log(`  概率:  主胜 ${fmt(p.homeWinProb)} | 平 ${fmt(p.drawProb)} | 客胜 ${fmt(p.awayWinProb)}`);
  console.log(`  预期进球: ${p.expectedHomeGoals.toFixed(2)} vs ${p.expectedAwayGoals.toFixed(2)}`);
  console.log(`  最可能比分: ${p.mostLikelyHome}-${p.mostLikelyAway} (${fmt(p.topScores[0].prob)})`);
  console.log(`  TOP3 比分:  ${p.topScores.map(s => `${s.home}-${s.away} (${fmt(s.prob)})`).join(', ')}`);
}
