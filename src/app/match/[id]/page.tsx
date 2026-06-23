// 单场比赛详情:已完结 / 进行中 / 未开赛 三种视图
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Flag } from '@/components/flag';
import { ProbabilityBar } from '@/components/probability-bar';
import { RichBlocks } from '@/components/rich-blocks';
import { StatisticalCard } from '@/components/statistical-card';
import { H2HCard } from '@/components/h2h-card';
import { MarketCard } from '@/components/market-card';
import { EnsembleCard } from '@/components/ensemble-card';
import { getAllFixtures, getFixtureById, getMatchesByTeam } from '@/lib/data';
import { STAGE_LABEL } from '@/lib/team-i18n';
import { cn } from '@/lib/utils';
import type { MatchWithTeams } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 静态导出:列出所有有效的比赛 ID,在 build 时生成静态 HTML
export async function generateStaticParams() {
  const fixtures = await getAllFixtures();
  return fixtures.map((m) => ({ id: m.id }));
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const match = await getFixtureById(id);
  if (!match) notFound();

  const finished = match.status === 'FINISHED';
  const live = match.status === 'LIVE' || match.status === 'PAUSED';

  // 双方最近 3 场已完结战绩
  const [homeRecent, awayRecent] = await Promise.all([
    getMatchesByTeam(match.homeTeamId),
    getMatchesByTeam(match.awayTeamId),
  ]);
  const homeForm = recentForm(homeRecent, match.homeTeamId, match.id);
  const awayForm = recentForm(awayRecent, match.awayTeamId, match.id);

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-pitch-muted hover:text-white">
        <span>←</span> 返回赛程
      </Link>

      <MatchHero match={match} />

      {finished ? (
        <FinishedView match={match} homeForm={homeForm} awayForm={awayForm} />
      ) : (
        <UpcomingView match={match} live={live} homeForm={homeForm} awayForm={awayForm} />
      )}
    </div>
  );
}

// ============================== 顶部 ==============================
function MatchHero({ match }: { match: MatchWithTeams }) {
  const date = parseISO(match.utcDate);
  const finished = match.status === 'FINISHED';
  const live = match.status === 'LIVE' || match.status === 'PAUSED';
  const stageLabel = match.groupId ? `${match.groupId} 组` : STAGE_LABEL[match.stage] ?? match.stage;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-pitch-line bg-pitch-deep/60 px-5 py-2.5 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-accent-green/15 px-2 py-0.5 font-semibold text-accent-green">
            {STAGE_LABEL[match.stage] ?? match.stage}
          </span>
          {match.groupId && <span className="text-pitch-muted">· {stageLabel}</span>}
          {match.matchday && <span className="text-pitch-muted">· 第 {match.matchday} 轮</span>}
        </div>
        <div>
          {live ? (
            <span className="chip-live">直播中</span>
          ) : finished ? (
            <span className="chip-finished">完赛</span>
          ) : (
            <span className="chip-upcoming">{format(date, 'M/d HH:mm', { locale: zhCN })}</span>
          )}
        </div>
      </div>
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-7 sm:gap-6 sm:py-10">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-green/[0.04] via-transparent to-accent-blue/[0.04]" />
        <TeamSide team={match.homeTeam} align="right" />
        <CenterScore match={match} />
        <TeamSide team={match.awayTeam} align="left" />
      </div>
    </section>
  );
}

function TeamSide({
  team,
  align,
}: {
  team: MatchWithTeams['homeTeam'];
  align: 'left' | 'right';
}) {
  return (
    <Link
      href={`/team/${team.id}`}
      className={cn(
        'group relative z-10 flex items-center gap-3 sm:gap-4',
        align === 'right' ? 'justify-end text-right' : 'justify-start text-left',
      )}
    >
      {align === 'left' && <Flag code={team.countryCode} size={72} />}
      <div className={align === 'right' ? 'text-right' : 'text-left'}>
        <div className="font-display text-lg font-bold transition group-hover:text-accent-green sm:text-2xl">
          {team.name}
        </div>
        {team.fifaRank && (
          <div className="text-[11px] text-pitch-muted">FIFA #{team.fifaRank}</div>
        )}
      </div>
      {align === 'right' && <Flag code={team.countryCode} size={72} />}
    </Link>
  );
}

function CenterScore({ match }: { match: MatchWithTeams }) {
  const finished = match.status === 'FINISHED';
  const live = match.status === 'LIVE' || match.status === 'PAUSED';
  const date = parseISO(match.utcDate);

  if (finished || live) {
    const a = match.homeScore ?? 0;
    const b = match.awayScore ?? 0;
    const winner = finished ? (a > b ? 'h' : b > a ? 'a' : 'd') : null;
    return (
      <div className="relative z-10 flex flex-col items-center">
        <div className="score-num text-4xl font-extrabold tabular-nums sm:text-6xl">
          <span className={cn(winner === 'a' && 'text-pitch-muted')}>{a}</span>
          <span className="mx-2 text-pitch-muted sm:mx-3">:</span>
          <span className={cn(winner === 'h' && 'text-pitch-muted')}>{b}</span>
        </div>
        {finished && (
          <div className="mt-1 text-[10px] uppercase tracking-widest text-pitch-muted">
            {winner === 'd' ? '战平' : '终场'}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="relative z-10 flex flex-col items-center">
      <div className="font-display text-3xl font-bold text-pitch-muted sm:text-5xl">VS</div>
      <div className="mt-2 text-[11px] text-pitch-muted">
        {format(date, 'M/d', { locale: zhCN })} · {formatDistanceToNowStrict(date, { locale: zhCN, addSuffix: true })}
      </div>
    </div>
  );
}

// ============================== 已完结视图 ==============================
function FinishedView({ match, homeForm, awayForm }: { match: MatchWithTeams; homeForm: FormItem[]; awayForm: FormItem[] }) {
  const a = match.homeScore ?? 0;
  const b = match.awayScore ?? 0;
  const winnerName =
    a > b ? `${match.homeTeam.name} 取胜` : b > a ? `${match.awayTeam.name} 取胜` : '双方握手言和';
  const goalsTotal = a + b;
  const description = (() => {
    if (Math.abs(a - b) >= 3) return `${winnerName},分差悬殊的一场较量。`;
    if (goalsTotal === 0) return '双方陷入闷战,互交白卷。';
    if (goalsTotal >= 5) return `${winnerName},一场进球大战。`;
    return `${winnerName},一场势均力敌的对决。`;
  })();

  return (
    <>
      {/* 战报摘要 */}
      <section className="card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">战报摘要</h2>
        <p className="mt-2 text-sm text-zinc-300">{description}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label={match.homeTeam.name + '进球'} value={a} accent="text-accent-green" />
          <Stat label="总进球" value={goalsTotal} accent="text-accent-gold" />
          <Stat label={match.awayTeam.name + '进球'} value={b} accent="text-accent-blue" />
        </div>
      </section>

      <FormCompare home={match.homeTeam.name} away={match.awayTeam.name} homeForm={homeForm} awayForm={awayForm} />
    </>
  );
}

// ============================== 未踢/进行中视图 ==============================
function AgreementBadge({ a }: { a: 'high' | 'medium' | 'low' }) {
  const m = {
    high: { tone: 'bg-accent-green/15 text-accent-green', label: '模型一致 ✓' },
    medium: { tone: 'bg-accent-gold/15 text-accent-gold', label: '部分一致' },
    low: { tone: 'bg-accent-red/15 text-accent-red', label: '模型分歧 ⚠' },
  } as const;
  return (
    <span className={cn('chip', m[a].tone)} title="AI 判断 vs 统计模型的一致性">
      {m[a].label}
    </span>
  );
}

function UpcomingView({
  match,
  live,
  homeForm,
  awayForm,
}: {
  match: MatchWithTeams;
  live: boolean;
  homeForm: FormItem[];
  awayForm: FormItem[];
}) {
  const p = match.prediction;
  const stat = match.statisticalPrediction;
  return (
    <>
      {match.modelAgreement && (
        <div className="flex justify-end -mt-1">
          <AgreementBadge a={match.modelAgreement} />
        </div>
      )}
      {p ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-pitch-line px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-gold/20 text-[11px] font-bold text-accent-gold">AI</span>
              <span className="font-display text-sm font-semibold">AI 判断</span>
            </div>
            <ConfidenceBadge value={p.confidence} />
          </div>
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8">
            <div className="text-center sm:text-right">
              <div className="text-xs text-pitch-muted">{match.homeTeam.name}</div>
              <div className="score-num mt-1 text-5xl font-extrabold text-accent-gold sm:text-7xl">
                {p.homeScore}
              </div>
            </div>
            <div className="text-center text-2xl font-display font-bold text-pitch-muted sm:text-3xl">
              VS
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-pitch-muted">{match.awayTeam.name}</div>
              <div className="score-num mt-1 text-5xl font-extrabold text-accent-gold sm:text-7xl">
                {p.awayScore}
              </div>
            </div>
          </div>
          <div className="border-t border-pitch-line bg-pitch-deep/40 px-5 py-4">
            <ProbabilityBar home={p.homeWinProb} draw={p.drawProb} away={p.awayWinProb} />
          </div>
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">AI 速读</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{p.reasoning}</p>
          </div>
        </section>
      ) : (
        <section className="card p-6 text-center text-sm text-pitch-muted">
          {live ? '比赛进行中' : '这场比赛的 AI 预测尚未生成'}
        </section>
      )}

      {match.ensemble && <EnsembleCard ensemble={match.ensemble} />}

      {stat && <StatisticalCard pred={stat} />}

      {match.marketConsensus && <MarketCard market={match.marketConsensus} />}

      {match.h2h && <H2HCard h2h={match.h2h} homeName={match.homeTeam.name} awayName={match.awayTeam.name} />}

      {p?.analysisDetail && p.analysisDetail.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pitch-muted">深度解读</h2>
          <RichBlocks blocks={p.analysisDetail} />
        </section>
      )}

      <FormCompare home={match.homeTeam.name} away={match.awayTeam.name} homeForm={homeForm} awayForm={awayForm} />
    </>
  );
}

// ============================== 共用组件 ==============================
function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-pitch-line bg-pitch-deep/40 p-3">
      <div className={cn('score-num text-2xl font-bold', accent)}>{value}</div>
      <div className="mt-0.5 text-[11px] text-pitch-muted">{label}</div>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone = value > 0.7 ? 'text-accent-green' : value > 0.5 ? 'text-accent-gold' : 'text-pitch-muted';
  return (
    <span className={cn('flex items-center gap-1 text-xs', tone)}>
      <span className="text-pitch-muted">置信度</span>
      <span className="font-mono font-bold tabular-nums">{pct}%</span>
    </span>
  );
}

interface FormItem {
  result: 'W' | 'D' | 'L';
  opponent: string;
  score: string;
  date: string;
}

function recentForm(matches: MatchWithTeams[], teamId: string, currentMatchId: string, limit = 3): FormItem[] {
  const finished = matches
    .filter((m) => m.id !== currentMatchId && m.status === 'FINISHED')
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, limit);
  return finished.map((m) => {
    const isHome = m.homeTeamId === teamId;
    const my = isHome ? m.homeScore ?? 0 : m.awayScore ?? 0;
    const ot = isHome ? m.awayScore ?? 0 : m.homeScore ?? 0;
    const opp = isHome ? m.awayTeam : m.homeTeam;
    const result: 'W' | 'D' | 'L' = my > ot ? 'W' : my < ot ? 'L' : 'D';
    return {
      result,
      opponent: opp.name,
      score: isHome ? `${my}-${ot}` : `${ot}-${my}`,
      date: m.utcDate,
    };
  });
}

function FormCompare({
  home,
  away,
  homeForm,
  awayForm,
}: {
  home: string;
  away: string;
  homeForm: FormItem[];
  awayForm: FormItem[];
}) {
  if (homeForm.length === 0 && awayForm.length === 0) return null;
  return (
    <section className="card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-pitch-muted">近期战绩</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <FormPanel name={home} items={homeForm} />
        <FormPanel name={away} items={awayForm} />
      </div>
    </section>
  );
}

function FormPanel({ name, items }: { name: string; items: FormItem[] }) {
  return (
    <div className="rounded-lg border border-pitch-line bg-pitch-deep/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{name}</span>
        <div className="flex gap-1">
          {items.length === 0 ? (
            <span className="text-[11px] text-pitch-muted">本届首场</span>
          ) : (
            items.map((it, i) => <ResultDot key={i} r={it.result} />)
          )}
        </div>
      </div>
      <ul className="space-y-1">
        {items.length === 0 ? (
          <li className="text-[11px] text-pitch-muted">暂无已完赛数据</li>
        ) : (
          items.map((it, i) => (
            <li key={i} className="flex items-center justify-between text-xs">
              <span className="text-pitch-muted">vs {it.opponent}</span>
              <span className="font-mono tabular-nums">{it.score}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ResultDot({ r }: { r: 'W' | 'D' | 'L' }) {
  const map = {
    W: { bg: 'bg-accent-green', t: '胜' },
    D: { bg: 'bg-pitch-muted', t: '平' },
    L: { bg: 'bg-accent-red', t: '负' },
  } as const;
  const x = map[r];
  return (
    <span
      title={x.t}
      className={cn('grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-pitch-deep', x.bg)}
    >
      {r}
    </span>
  );
}
