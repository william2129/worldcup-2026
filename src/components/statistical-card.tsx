import { ProbabilityBar } from './probability-bar';
import { cn } from '@/lib/utils';
import type { StatisticalPrediction } from '@/lib/types';

export function StatisticalCard({ pred }: { pred: StatisticalPrediction }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-pitch-line px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-blue/20 text-[10px] font-bold text-accent-blue">
            STAT
          </span>
          <span className="font-display text-sm font-semibold">数据模型预测</span>
        </div>
        <span className="text-[10px] text-pitch-muted">Elo + Dixon-Coles 修正</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5">
        {/* 预期进球 */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">预期进球</h4>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="score-num text-2xl font-bold tabular-nums">
              {pred.expectedHomeGoals.toFixed(2)}
            </span>
            <span className="text-pitch-muted">vs</span>
            <span className="score-num text-2xl font-bold tabular-nums">
              {pred.expectedAwayGoals.toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-pitch-muted">基于双方 Elo 评分推算</p>
        </div>

        {/* 最可能比分 */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">最可能比分</h4>
          <div className="score-num mt-1 text-2xl font-bold text-accent-blue tabular-nums">
            {pred.mostLikelyHome} : {pred.mostLikelyAway}
          </div>
          <p className="mt-1 text-[11px] text-pitch-muted">
            概率 {Math.round((pred.topScores[0]?.prob ?? 0) * 100)}%(单点最高)
          </p>
        </div>
      </div>

      {/* 概率条 */}
      <div className="border-t border-pitch-line bg-pitch-deep/40 px-5 py-3">
        <ProbabilityBar home={pred.homeWinProb} draw={pred.drawProb} away={pred.awayWinProb} />
      </div>

      {/* Top 3 比分 */}
      <div className="px-5 py-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">最可能的 3 个比分</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {pred.topScores.map((s, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border px-3 py-2 text-center',
                i === 0
                  ? 'border-accent-blue/40 bg-accent-blue/8'
                  : 'border-pitch-line bg-pitch-deep/40',
              )}
            >
              <div className="score-num text-base font-bold tabular-nums">
                {s.home} - {s.away}
              </div>
              <div className="text-[10px] text-pitch-muted">{Math.round(s.prob * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
