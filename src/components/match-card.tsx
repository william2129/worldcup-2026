import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Flag } from './flag';
import type { MatchWithTeams } from '@/lib/types';
import { cn } from '@/lib/utils';

function StatusBadge({ m }: { m: MatchWithTeams }) {
  if (m.status === 'LIVE' || m.status === 'PAUSED') {
    return <span className="chip-live">直播中</span>;
  }
  if (m.status === 'FINISHED') {
    return <span className="chip-finished">完赛</span>;
  }
  return <span className="chip-upcoming">未开始</span>;
}

function TeamRow({ name, code, score, winner }: { name: string; code: string; score: number | null; winner: boolean | null }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', winner === false && 'opacity-60')}>
      <div className="flex items-center gap-2 min-w-0">
        <Flag code={code} size={24} />
        <span className={cn('truncate text-sm', winner && 'font-semibold')}>{name}</span>
      </div>
      <span className={cn('score-num text-xl', winner && 'text-accent-green')}>
        {score ?? '-'}
      </span>
    </div>
  );
}

export function MatchCard({ match }: { match: MatchWithTeams }) {
  const m = match;
  const date = parseISO(m.utcDate);
  const finished = m.status === 'FINISHED';
  const homeWinner = finished ? (m.homeScore ?? 0) > (m.awayScore ?? 0) : null;
  const awayWinner = finished ? (m.awayScore ?? 0) > (m.homeScore ?? 0) : null;

  return (
    <Link
      href={`/match/${m.id}`}
      className="card block p-4 transition hover:border-accent-green/40 hover:shadow-glow-green"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-pitch-muted">
        <span>
          {m.groupId ? `小组赛 · ${m.groupId} 组` : m.stage}
          <span className="mx-1.5 text-pitch-line">·</span>
          {format(date, 'MM/dd HH:mm', { locale: zhCN })}
        </span>
        <StatusBadge m={m} />
      </div>
      <div className="space-y-2">
        <TeamRow name={m.homeTeam.name} code={m.homeTeam.countryCode} score={m.homeScore} winner={homeWinner} />
        <TeamRow name={m.awayTeam.name} code={m.awayTeam.countryCode} score={m.awayScore} winner={awayWinner} />
      </div>
      {m.prediction && !finished && (
        <div className="mt-3 flex items-center justify-between border-t border-pitch-line pt-2.5 text-xs">
          <span className="text-pitch-muted">AI 预测</span>
          <span className="font-mono tabular-nums text-accent-gold">
            {m.prediction.homeScore} - {m.prediction.awayScore}
            <span className="ml-2 text-pitch-muted">置信 {Math.round(m.prediction.confidence * 100)}%</span>
          </span>
        </div>
      )}
    </Link>
  );
}
