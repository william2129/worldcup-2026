// 首页 - 顶部 Hero + Tab 切换三段(即将进行 / 已完结 / 未来)
import { FixturesTabs } from '@/components/fixtures-tabs';
import { getAllFixtures } from '@/lib/data';

export default async function HomePage() {
  const fixtures = await getAllFixtures();

  const liveCount = fixtures.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED').length;
  const finishedCount = fixtures.filter((m) => m.status === 'FINISHED').length;
  const upcomingCount = fixtures.length - liveCount - finishedCount;
  const now = new Date().toISOString();

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-gold/10" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-accent-green/15 text-accent-green">2026 FIFA 世界杯</span>
            <span className="chip bg-pitch-line text-pitch-muted">美 · 加 · 墨</span>
            {liveCount > 0 && <span className="chip-live">{liveCount} 场进行中</span>}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-wide sm:text-3xl">
            48 支球队 · 104 场对决 · AI 全程预测
          </h1>
          <p className="mt-2 max-w-xl text-sm text-pitch-muted">
            实时同步赛程与比分,基于真实战况由 AI 给出后续比分预测与战术分析。
          </p>
          <div className="mt-4 flex gap-5 text-sm">
            <Stat label="已完结" value={finishedCount} accent="text-pitch-muted" />
            <Stat label="进行中" value={liveCount} accent="text-accent-red" />
            <Stat label="待开赛" value={upcomingCount} accent="text-accent-blue" />
          </div>
        </div>
      </section>

      <FixturesTabs fixtures={fixtures} now={now} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`score-num text-xl font-bold ${accent}`}>{value}</span>
      <span className="text-xs text-pitch-muted">{label}</span>
    </div>
  );
}
