// 小组赛积分榜
import Link from 'next/link';
import { Flag } from '@/components/flag';
import { SectionHeader } from '@/components/section-header';
import { cn } from '@/lib/utils';
import { getStandings, getTeams } from '@/lib/data';

export default async function GroupsPage() {
  const [standings, teams] = await Promise.all([getStandings(), getTeams()]);
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const groupIds = Object.keys(standings).sort();

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader
          title="小组赛积分榜"
          subtitle="每组前 2 名 + 8 个最佳第三名晋级 1/16 决赛"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {groupIds.map((gid) => (
          <section key={gid} className="card overflow-hidden">
            <header className="flex items-center justify-between border-b border-pitch-line px-4 py-3">
              <h3 className="font-display text-base font-semibold">
                <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-md bg-accent-green/15 text-accent-green">
                  {gid}
                </span>
                小组
              </h3>
              <span className="text-xs text-pitch-muted">{standings[gid].length} 队</span>
            </header>
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-pitch-muted">
                <tr className="border-b border-pitch-line">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="py-2 text-left">球队</th>
                  <th className="px-2 py-2 text-center">赛</th>
                  <th className="px-2 py-2 text-center">胜</th>
                  <th className="px-2 py-2 text-center">平</th>
                  <th className="px-2 py-2 text-center">负</th>
                  <th className="px-2 py-2 text-center">净</th>
                  <th className="px-2 py-2 text-center font-semibold text-accent-gold">分</th>
                  <th className="px-3 py-2 text-right">出线率</th>
                </tr>
              </thead>
              <tbody>
                {standings[gid].map((s, idx) => {
                  const team = teamMap.get(s.teamId);
                  if (!team) return null;
                  const qualified = idx < 2;
                  return (
                    <tr
                      key={s.teamId}
                      className={cn(
                        'border-b border-pitch-line/60 last:border-b-0 transition hover:bg-pitch-line/30',
                        qualified && 'bg-accent-green/[0.03]',
                      )}
                    >
                      <td className="px-3 py-2 text-pitch-muted tabular-nums">{idx + 1}</td>
                      <td className="py-2">
                        <Link
                          href={`/team/${team.id}`}
                          className="flex items-center gap-2 hover:text-accent-green"
                        >
                          <Flag code={team.countryCode} size={22} />
                          <span className="font-medium">{team.name}</span>
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums">{s.played}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{s.win}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{s.draw}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{s.loss}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-pitch-muted">
                        {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                      </td>
                      <td className="px-2 py-2 text-center font-bold tabular-nums text-accent-gold">{s.points}</td>
                      <td className="px-3 py-2 text-right">
                        <ProbPill p={s.qualifyProb} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}

function ProbPill({ p }: { p: number }) {
  const pct = Math.round(p * 100);
  const tone = p > 0.7 ? 'text-accent-green' : p > 0.45 ? 'text-accent-gold' : 'text-pitch-muted';
  return <span className={cn('font-mono tabular-nums text-xs', tone)}>{pct}%</span>;
}
