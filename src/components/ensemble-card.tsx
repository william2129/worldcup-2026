import { ProbabilityBar } from './probability-bar';
import { cn } from '@/lib/utils';
import type { EnsemblePrediction } from '@/lib/types';

export function EnsembleCard({ ensemble }: { ensemble: EnsemblePrediction }) {
  const max = Math.max(ensemble.homeWinProb, ensemble.drawProb, ensemble.awayWinProb);
  const direction =
    ensemble.homeWinProb === max ? 'h' : ensemble.awayWinProb === max ? 'a' : 'd';
  const directionLabel = direction === 'h' ? '主胜' : direction === 'a' ? '客胜' : '平局';

  return (
    <section className="card overflow-hidden border-accent-gold/30">
      <div className="flex items-center justify-between border-b border-pitch-line bg-accent-gold/[0.06] px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-gold/25 text-[10px] font-bold text-accent-gold">
            ★
          </span>
          <span className="font-display text-sm font-semibold">综合预测(3 模型加权)</span>
        </div>
        <span className="text-[10px] text-pitch-muted">最终建议</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">推荐方向</h4>
          <div className={cn('mt-1 font-display text-2xl font-bold',
            direction === 'h' ? 'text-accent-green' : direction === 'a' ? 'text-accent-blue' : 'text-pitch-muted',
          )}>
            {directionLabel}
          </div>
          <div className="mt-1 text-[11px] text-pitch-muted">概率 {Math.round(max * 100)}%</div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">共识比分</h4>
          <div className="score-num mt-1 text-2xl font-bold text-accent-gold tabular-nums">
            {ensemble.consensusHome} : {ensemble.consensusAway}
          </div>
          <div className="mt-1 text-[11px] text-pitch-muted">AI + 数据模型平均</div>
        </div>
      </div>

      <div className="border-t border-pitch-line bg-pitch-deep/40 px-5 py-3">
        <ProbabilityBar home={ensemble.homeWinProb} draw={ensemble.drawProb} away={ensemble.awayWinProb} />
      </div>

      <div className="px-5 py-3 text-[11px] text-pitch-muted">
        <span>模型权重: </span>
        <span className="text-zinc-300">AI {Math.round(ensemble.weights.ai * 100)}% · </span>
        <span className="text-zinc-300">数据 {Math.round(ensemble.weights.statistical * 100)}% · </span>
        <span className="text-zinc-300">市场 {Math.round(ensemble.weights.market * 100)}%</span>
      </div>
    </section>
  );
}
