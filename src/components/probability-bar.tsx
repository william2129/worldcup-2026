// 三方概率条:主胜/平局/客胜
import { cn } from '@/lib/utils';

interface ProbabilityBarProps {
  home: number;
  draw: number;
  away: number;
  className?: string;
  showLabels?: boolean;
}

export function ProbabilityBar({ home, draw, away, className, showLabels = true }: ProbabilityBarProps) {
  const total = home + draw + away;
  const h = (home / total) * 100;
  const d = (draw / total) * 100;
  const a = (away / total) * 100;
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-pitch-line">
        <div className="bg-accent-green/85" style={{ width: `${h}%` }} />
        <div className="bg-pitch-muted/60" style={{ width: `${d}%` }} />
        <div className="bg-accent-blue/85" style={{ width: `${a}%` }} />
      </div>
      {showLabels && (
        <div className="flex justify-between text-[11px] text-pitch-muted tabular-nums">
          <span>主胜 {Math.round(home * 100)}%</span>
          <span>平 {Math.round(draw * 100)}%</span>
          <span>客胜 {Math.round(away * 100)}%</span>
        </div>
      )}
    </div>
  );
}
