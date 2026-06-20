// 球队列表
import Link from 'next/link';
import { Flag } from '@/components/flag';
import { SectionHeader } from '@/components/section-header';
import { getTeams } from '@/lib/data';

export default async function TeamsPage() {
  const teams = await getTeams();
  // 按小组分组
  const byGroup = new Map<string, typeof teams>();
  for (const t of teams) {
    const g = t.groupId ?? 'X';
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(t);
  }
  const groupIds = Array.from(byGroup.keys()).sort();

  return (
    <div className="space-y-8">
      <SectionHeader title="参赛球队" subtitle={`共 ${teams.length} 支`} />
      {groupIds.map((gid) => (
        <section key={gid}>
          <h3 className="mb-3 font-display text-sm font-semibold text-pitch-muted">
            <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded bg-accent-green/15 text-accent-green">
              {gid}
            </span>
            组
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {byGroup.get(gid)!.map((t) => (
              <Link
                key={t.id}
                href={`/team/${t.id}`}
                className="card flex items-center gap-3 p-4 transition hover:border-accent-green/40"
              >
                <Flag code={t.countryCode} size={40} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="text-xs text-pitch-muted">FIFA #{t.fifaRank ?? '-'}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
