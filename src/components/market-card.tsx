import { ProbabilityBar } from './probability-bar';
import type { MarketConsensus } from '@/lib/types';

export function MarketCard({ market }: { market: MarketConsensus }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-pitch-line px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-green/15 text-[10px] font-bold text-accent-green">
            ¥
          </span>
          <span className="font-display text-sm font-semibold">市场共识</span>
        </div>
        <span className="text-[10px] text-pitch-muted">{market.bookmakerCount} 家博彩公司加权平均</span>
      </div>
      <div className="space-y-3 p-5">
        <ProbabilityBar
          home={market.homeWinProb}
          draw={market.drawProb}
          away={market.awayWinProb}
        />
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-pitch-muted">
          <span>数据来源:</span>
          {market.bookmakers.slice(0, 8).map((b) => (
            <span key={b} className="rounded bg-pitch-line/40 px-1.5 py-0.5">
              {b}
            </span>
          ))}
          {market.bookmakers.length > 8 && (
            <span className="text-pitch-muted">+{market.bookmakers.length - 8} 家</span>
          )}
        </div>
      </div>
    </section>
  );
}
