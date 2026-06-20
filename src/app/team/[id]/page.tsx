// 球队详情页
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Flag } from '@/components/flag';
import { MatchCard } from '@/components/match-card';
import { SectionHeader } from '@/components/section-header';
import { RichBlocks } from '@/components/rich-blocks';
import { getMatchesByTeam, getTeamAnalysis, getTeamById, getTeams } from '@/lib/data';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 静态导出:列出 48 个球队 ID,build 时生成静态 HTML
export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((t) => ({ id: t.id }));
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const team = await getTeamById(id);
  if (!team) notFound();

  const [analysis, matches] = await Promise.all([
    getTeamAnalysis(id),
    getMatchesByTeam(id),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/teams" className="text-xs text-pitch-muted hover:text-white">
        ← 返回球队列表
      </Link>

      {/* 头部 */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-5 bg-gradient-to-r from-accent-green/8 to-transparent p-6">
          <Flag code={team.countryCode} size={88} />
          <div>
            <h1 className="font-display text-3xl font-bold">{team.name}</h1>
            <div className="mt-1 text-sm text-pitch-muted">
              {team.nameEn} · FIFA 排名 #{team.fifaRank ?? '-'}
              {team.groupId && <> · 所在 {team.groupId} 组</>}
            </div>
          </div>
        </div>
      </section>

      {/* AI 分析 */}
      {analysis ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="card p-6">
              <SectionHeader title="AI 整体分析" subtitle="基于历史成绩、阵容、战术倾向自动生成" />
              <p className="text-sm leading-relaxed text-zinc-300">{analysis.summary}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Bullets label="优势" items={analysis.strengths} accent="text-accent-green" />
                <Bullets label="短板" items={analysis.weaknesses} accent="text-accent-red" />
              </div>
              <div className="mt-4">
                <Bullets label="关键球员" items={analysis.keyPlayers} accent="text-accent-gold" />
              </div>
            </div>
            <div className="card flex flex-col gap-4 p-6">
              <ProbStat label="夺冠概率" value={analysis.championProb} highlight />
              <ProbStat label="进入淘汰赛" value={analysis.knockoutProb} />
            </div>
          </section>
          {analysis.analysisDetail && analysis.analysisDetail.length > 0 && (
            <section className="card p-6">
              <SectionHeader title="深度解读" subtitle="球队背景、战术风格、看球小白指南" />
              <RichBlocks blocks={analysis.analysisDetail} />
            </section>
          )}
        </>
      ) : (
        <section className="card p-6 text-sm text-pitch-muted">
          该球队的 AI 分析尚未生成。
        </section>
      )}

      {/* 比赛 */}
      <section>
        <SectionHeader title="赛程" subtitle={`共 ${matches.length} 场`} />
        <div className="grid gap-3 sm:grid-cols-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Bullets({ label, items, accent }: { label: string; items: string[]; accent: string }) {
  return (
    <div>
      <h4 className={cn('text-xs font-semibold uppercase tracking-wider', accent)}>{label}</h4>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-zinc-300">
            <span className={cn('h-1 w-1 rounded-full', accent.replace('text-', 'bg-'))} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProbStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="text-xs text-pitch-muted">{label}</div>
      <div className={cn('score-num mt-1 text-3xl font-bold', highlight ? 'text-accent-gold' : 'text-zinc-200')}>
        {pct}%
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-pitch-line">
        <div
          className={cn('h-full', highlight ? 'bg-accent-gold' : 'bg-accent-green')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
