import {
  Swords, Shield, Star, Flame, Lightbulb, Eye,
  History, Crown, Target, Flag as FlagIcon, Zap, Sparkles,
} from 'lucide-react';
import type { AnalysisBlock, AnalysisIcon } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<AnalysisIcon, React.ComponentType<{ className?: string }>> = {
  sword: Swords,
  shield: Shield,
  star: Star,
  flame: Flame,
  lightbulb: Lightbulb,
  eye: Eye,
  history: History,
  crown: Crown,
  target: Target,
  flag: FlagIcon,
  zap: Zap,
  crystal: Sparkles,
};

const ICON_TONE: Record<AnalysisIcon, string> = {
  sword: 'text-accent-red bg-accent-red/12',
  shield: 'text-accent-blue bg-accent-blue/12',
  star: 'text-accent-gold bg-accent-gold/15',
  flame: 'text-accent-red bg-accent-red/12',
  lightbulb: 'text-accent-gold bg-accent-gold/15',
  eye: 'text-accent-blue bg-accent-blue/12',
  history: 'text-pitch-muted bg-pitch-line',
  crown: 'text-accent-gold bg-accent-gold/15',
  target: 'text-accent-green bg-accent-green/15',
  flag: 'text-accent-green bg-accent-green/15',
  zap: 'text-accent-gold bg-accent-gold/15',
  crystal: 'text-accent-blue bg-accent-blue/12',
};

export function RichBlocks({ blocks, className }: { blocks: AnalysisBlock[]; className?: string }) {
  return (
    <div className={cn('grid gap-3', className)}>
      {blocks.map((b, i) => {
        const Icon = ICON_MAP[b.icon] ?? Lightbulb;
        const tone = ICON_TONE[b.icon] ?? 'text-accent-gold bg-accent-gold/15';
        return (
          <div
            key={i}
            className="flex gap-3 rounded-lg border border-pitch-line bg-pitch-deep/40 p-4"
          >
            <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md', tone)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-zinc-100">{b.title}</h4>
              <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-300">{b.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
