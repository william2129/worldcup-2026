'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MatchCard } from './match-card';
import { cn } from '@/lib/utils';
import type { MatchWithTeams } from '@/lib/types';

interface Props {
  fixtures: MatchWithTeams[];
  /** 当前时间(ISO),用于切分"即将"和"未来" */
  now: string;
}

type TabKey = 'upcoming' | 'finished' | 'future';

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: 'upcoming', label: '即将进行', hint: '进行中 + 未来 48 小时内' },
  { key: 'finished', label: '已完结', hint: '真实比分' },
  { key: 'future', label: '未来比赛', hint: 'AI 预测' },
];

function groupByDate(matches: MatchWithTeams[]) {
  const map = new Map<string, MatchWithTeams[]>();
  for (const m of matches) {
    const d = m.utcDate.slice(0, 10);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(m);
  }
  return Array.from(map.entries())
    .map(([date, list]) => ({ date, list: list.sort((a, b) => a.utcDate.localeCompare(b.utcDate)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function FixturesTabs({ fixtures, now }: Props) {
  const [tab, setTab] = useState<TabKey>('upcoming');
  const nowMs = Date.parse(now);
  const horizonMs = nowMs + 48 * 60 * 60 * 1000;

  const sliced = useMemo(() => {
    const finished: MatchWithTeams[] = [];
    const upcoming: MatchWithTeams[] = [];
    const future: MatchWithTeams[] = [];
    for (const m of fixtures) {
      if (m.status === 'FINISHED') {
        finished.push(m);
        continue;
      }
      if (m.status === 'LIVE' || m.status === 'PAUSED') {
        upcoming.push(m);
        continue;
      }
      const t = Date.parse(m.utcDate);
      if (t < horizonMs) upcoming.push(m);
      else future.push(m);
    }
    // 已完结按时间倒序,未来按时间正序
    finished.sort((a, b) => b.utcDate.localeCompare(a.utcDate));
    upcoming.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
    future.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
    return { finished, upcoming, future };
  }, [fixtures, horizonMs]);

  const counts = {
    upcoming: sliced.upcoming.length,
    finished: sliced.finished.length,
    future: sliced.future.length,
  };

  const active =
    tab === 'upcoming' ? sliced.upcoming : tab === 'finished' ? sliced.finished : sliced.future;
  const grouped = groupByDate(active);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-pitch-line bg-pitch-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm transition',
              tab === t.key
                ? 'bg-accent-green/15 text-accent-green'
                : 'text-pitch-muted hover:text-white',
            )}
          >
            <span className="font-medium">{t.label}</span>
            <span className="ml-2 rounded-md bg-pitch-line/50 px-1.5 py-0.5 text-[10px] tabular-nums">
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-pitch-muted">{TABS.find((t) => t.key === tab)?.hint}</p>

      {grouped.length === 0 ? (
        <div className="card p-10 text-center text-sm text-pitch-muted">该分类暂无比赛</div>
      ) : (
        grouped.map((g) => (
          <section key={g.date}>
            <h3 className="mb-3 flex items-center gap-2 text-sm">
              <span className="h-px flex-1 bg-pitch-line" />
              <span className="font-display text-pitch-muted">
                {format(parseISO(g.date + 'T00:00:00Z'), 'M 月 d 日 EEEE', { locale: zhCN })}
              </span>
              <span className="rounded-md bg-pitch-line/40 px-2 py-0.5 text-[10px] tabular-nums text-pitch-muted">
                {g.list.length}
              </span>
              <span className="h-px flex-1 bg-pitch-line" />
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.list.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
