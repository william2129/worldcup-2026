import type { HeadToHead } from '@/lib/types';

export function H2HCard({ h2h, homeName, awayName }: { h2h: HeadToHead; homeName: string; awayName: string }) {
  // 解析 W-D-L
  const parts = h2h.overall.match(/(\d+)W-(\d+)D-(\d+)L/);
  const wins = parts ? parseInt(parts[1]) : 0;
  const draws = parts ? parseInt(parts[2]) : 0;
  const losses = parts ? parseInt(parts[3]) : 0;
  const total = wins + draws + losses;

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-pitch-line text-[10px] font-bold text-pitch-muted">
            H2H
          </span>
          <h2 className="font-display text-sm font-semibold">历史交锋</h2>
        </div>
        <span className="text-xs text-pitch-muted">从 {homeName} 角度</span>
      </div>

      {total > 0 ? (
        <>
          {/* 胜平负柱 */}
          <div className="mb-3 flex h-7 w-full overflow-hidden rounded-lg bg-pitch-deep/40 text-[11px] font-semibold">
            {wins > 0 && (
              <div
                className="flex items-center justify-center bg-accent-green/85 text-pitch-deep"
                style={{ width: `${(wins / total) * 100}%` }}
              >
                {wins} 胜
              </div>
            )}
            {draws > 0 && (
              <div
                className="flex items-center justify-center bg-pitch-muted/60 text-pitch-deep"
                style={{ width: `${(draws / total) * 100}%` }}
              >
                {draws} 平
              </div>
            )}
            {losses > 0 && (
              <div
                className="flex items-center justify-center bg-accent-red/85 text-pitch-deep"
                style={{ width: `${(losses / total) * 100}%` }}
              >
                {losses} 负
              </div>
            )}
          </div>

          {/* 最近交锋 */}
          {h2h.recentScores.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-pitch-muted">最近交锋</h4>
              <ul className="mt-1 space-y-1">
                {h2h.recentScores.map((s, i) => (
                  <li key={i} className="text-sm font-mono tabular-nums text-zinc-300">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-pitch-muted">两队历史上未曾在正式比赛中交锋</p>
      )}

      {h2h.note && (
        <p className="mt-3 border-t border-pitch-line pt-3 text-[13px] leading-relaxed text-zinc-300">
          {h2h.note}
        </p>
      )}
    </section>
  );
}
