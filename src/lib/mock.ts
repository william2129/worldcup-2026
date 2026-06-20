// 占位 mock 数据,用于 UI 开发。真实数据接入后会被 DB 查询替代。
import type { Team, MatchWithTeams, GroupStanding, TeamAnalysis } from './types';

const t = (
  id: string,
  name: string,
  nameEn: string,
  countryCode: string,
  groupId: string,
  fifaRank: number,
): Team => ({ id, name, nameEn, countryCode: countryCode.toLowerCase(), groupId, fifaRank });

export const TEAMS_MOCK: Team[] = [
  // A
  t('mex', '墨西哥', 'Mexico', 'mx', 'A', 18),
  t('can', '加拿大', 'Canada', 'ca', 'A', 31),
  t('mar', '摩洛哥', 'Morocco', 'ma', 'A', 14),
  t('jpn', '日本', 'Japan', 'jp', 'A', 17),
  // B
  t('esp', '西班牙', 'Spain', 'es', 'B', 3),
  t('ned', '荷兰', 'Netherlands', 'nl', 'B', 7),
  t('uru', '乌拉圭', 'Uruguay', 'uy', 'B', 11),
  t('uzb', '乌兹别克斯坦', 'Uzbekistan', 'uz', 'B', 57),
  // C
  t('fra', '法国', 'France', 'fr', 'C', 2),
  t('ger', '德国', 'Germany', 'de', 'C', 9),
  t('mex2', '塞内加尔', 'Senegal', 'sn', 'C', 19),
  t('kor', '韩国', 'South Korea', 'kr', 'C', 22),
  // D
  t('eng', '英格兰', 'England', 'gb-eng', 'D', 4),
  t('por', '葡萄牙', 'Portugal', 'pt', 'D', 6),
  t('ecu', '厄瓜多尔', 'Ecuador', 'ec', 'D', 24),
  t('aus', '澳大利亚', 'Australia', 'au', 'D', 25),
  // E
  t('arg', '阿根廷', 'Argentina', 'ar', 'E', 1),
  t('bra', '巴西', 'Brazil', 'br', 'E', 5),
  t('cro', '克罗地亚', 'Croatia', 'hr', 'E', 10),
  t('iri', '伊朗', 'Iran', 'ir', 'E', 20),
  // F
  t('bel', '比利时', 'Belgium', 'be', 'F', 8),
  t('col', '哥伦比亚', 'Colombia', 'co', 'F', 12),
  t('sui', '瑞士', 'Switzerland', 'ch', 'F', 19),
  t('ksa', '沙特阿拉伯', 'Saudi Arabia', 'sa', 'F', 56),
];

const teamMap = new Map(TEAMS_MOCK.map((x) => [x.id, x]));

const m = (
  id: string,
  stage: MatchWithTeams['stage'],
  groupId: string | undefined,
  utcDate: string,
  status: MatchWithTeams['status'],
  homeId: string,
  awayId: string,
  homeScore: number | null,
  awayScore: number | null,
  pred?: { h: number; a: number; conf: number; reasoning: string },
): MatchWithTeams => ({
  id,
  stage,
  groupId,
  utcDate,
  status,
  homeTeamId: homeId,
  awayTeamId: awayId,
  homeScore,
  awayScore,
  homeTeam: teamMap.get(homeId)!,
  awayTeam: teamMap.get(awayId)!,
  prediction: pred
    ? {
        matchId: id,
        homeScore: pred.h,
        awayScore: pred.a,
        homeWinProb: pred.h > pred.a ? 0.5 + pred.conf * 0.3 : pred.h < pred.a ? 0.2 : 0.3,
        drawProb: pred.h === pred.a ? 0.45 : 0.25,
        awayWinProb: pred.a > pred.h ? 0.5 + pred.conf * 0.3 : pred.a < pred.h ? 0.2 : 0.3,
        confidence: pred.conf,
        reasoning: pred.reasoning,
        generatedAt: new Date().toISOString(),
        generatedBy: 'mock',
      }
    : undefined,
});

export const FIXTURES_MOCK: MatchWithTeams[] = [
  m(
    'g1',
    'GROUP_STAGE',
    'A',
    '2026-06-11T20:00:00Z',
    'SCHEDULED',
    'mex',
    'can',
    null,
    null,
    {
      h: 2,
      a: 1,
      conf: 0.62,
      reasoning:
        '墨西哥主场作战,中场拉伸能力优于加拿大;加拿大边路反击具备威胁,预计开场进球但被反超。',
    },
  ),
  m(
    'g2',
    'GROUP_STAGE',
    'A',
    '2026-06-12T18:00:00Z',
    'LIVE',
    'mar',
    'jpn',
    1,
    1,
    {
      h: 2,
      a: 1,
      conf: 0.51,
      reasoning: '摩洛哥防守稳健,日本传控精细,预计低比分胶着。',
    },
  ),
  m(
    'g3',
    'GROUP_STAGE',
    'B',
    '2026-06-11T15:00:00Z',
    'FINISHED',
    'esp',
    'uru',
    3,
    0,
    {
      h: 2,
      a: 0,
      conf: 0.7,
      reasoning: '西班牙中前场配合远胜于乌拉圭,后者中场断档明显。',
    },
  ),
  m(
    'g4',
    'GROUP_STAGE',
    'B',
    '2026-06-12T15:00:00Z',
    'SCHEDULED',
    'ned',
    'uzb',
    null,
    null,
    {
      h: 3,
      a: 0,
      conf: 0.78,
      reasoning: '荷兰整体实力压制,乌兹别克斯坦首次世界杯经验不足。',
    },
  ),
  m(
    'g5',
    'GROUP_STAGE',
    'E',
    '2026-06-13T20:00:00Z',
    'SCHEDULED',
    'arg',
    'iri',
    null,
    null,
    {
      h: 2,
      a: 0,
      conf: 0.74,
      reasoning: '阿根廷拥有梅西+劳塔罗组合,伊朗主打防守反击,难以撕开。',
    },
  ),
  m(
    'g6',
    'GROUP_STAGE',
    'E',
    '2026-06-13T17:00:00Z',
    'SCHEDULED',
    'bra',
    'cro',
    null,
    null,
    {
      h: 1,
      a: 1,
      conf: 0.55,
      reasoning: '克罗地亚中场莫德里奇虽老,但调度仍优秀;巴西边路威胁,预计互交白卷或平。',
    },
  ),
  m(
    'g7',
    'GROUP_STAGE',
    'C',
    '2026-06-14T19:00:00Z',
    'SCHEDULED',
    'fra',
    'kor',
    null,
    null,
    {
      h: 2,
      a: 0,
      conf: 0.7,
      reasoning: '法国姆巴佩领衔,韩国整体年轻化,实力差距明显。',
    },
  ),
  m(
    'g8',
    'GROUP_STAGE',
    'D',
    '2026-06-14T16:00:00Z',
    'SCHEDULED',
    'eng',
    'aus',
    null,
    null,
    {
      h: 2,
      a: 0,
      conf: 0.68,
      reasoning: '英格兰锋线深度足够,澳大利亚体能型打法对英格兰影响有限。',
    },
  ),
];

// 小组积分 mock
const standing = (
  teamId: string,
  played: number,
  win: number,
  draw: number,
  loss: number,
  gf: number,
  ga: number,
  rank: number,
  qProb: number,
): GroupStanding => ({
  teamId,
  played,
  win,
  draw,
  loss,
  goalsFor: gf,
  goalsAgainst: ga,
  goalDiff: gf - ga,
  points: win * 3 + draw,
  rank,
  qualifyProb: qProb,
});

export const STANDINGS_MOCK: Record<string, GroupStanding[]> = {
  A: [
    standing('mex', 1, 1, 0, 0, 2, 1, 1, 0.78),
    standing('mar', 1, 0, 1, 0, 1, 1, 2, 0.65),
    standing('jpn', 1, 0, 1, 0, 1, 1, 3, 0.58),
    standing('can', 1, 0, 0, 1, 1, 2, 4, 0.42),
  ],
  B: [
    standing('esp', 1, 1, 0, 0, 3, 0, 1, 0.92),
    standing('ned', 0, 0, 0, 0, 0, 0, 2, 0.81),
    standing('uru', 1, 0, 0, 1, 0, 3, 3, 0.38),
    standing('uzb', 0, 0, 0, 0, 0, 0, 4, 0.18),
  ],
  C: [
    standing('fra', 0, 0, 0, 0, 0, 0, 1, 0.88),
    standing('ger', 0, 0, 0, 0, 0, 0, 2, 0.76),
    standing('mex2', 0, 0, 0, 0, 0, 0, 3, 0.55),
    standing('kor', 0, 0, 0, 0, 0, 0, 4, 0.4),
  ],
  D: [
    standing('eng', 0, 0, 0, 0, 0, 0, 1, 0.84),
    standing('por', 0, 0, 0, 0, 0, 0, 2, 0.79),
    standing('ecu', 0, 0, 0, 0, 0, 0, 3, 0.52),
    standing('aus', 0, 0, 0, 0, 0, 0, 4, 0.36),
  ],
  E: [
    standing('arg', 0, 0, 0, 0, 0, 0, 1, 0.91),
    standing('bra', 0, 0, 0, 0, 0, 0, 2, 0.86),
    standing('cro', 0, 0, 0, 0, 0, 0, 3, 0.6),
    standing('iri', 0, 0, 0, 0, 0, 0, 4, 0.28),
  ],
  F: [
    standing('bel', 0, 0, 0, 0, 0, 0, 1, 0.74),
    standing('col', 0, 0, 0, 0, 0, 0, 2, 0.69),
    standing('sui', 0, 0, 0, 0, 0, 0, 3, 0.54),
    standing('ksa', 0, 0, 0, 0, 0, 0, 4, 0.32),
  ],
};

// 球队分析 mock
export const TEAM_ANALYSIS_MOCK: Record<string, TeamAnalysis> = {
  arg: {
    teamId: 'arg',
    strengths: ['梅西的关键球能力', '中前场创造力', '比赛经验与心态'],
    weaknesses: ['后防年龄结构偏老', '换人深度有限'],
    keyPlayers: ['利昂内尔·梅西', '劳塔罗·马丁内斯', '阿尔瓦雷斯'],
    championProb: 0.16,
    knockoutProb: 0.91,
    summary: '卫冕冠军延续战术体系,梅西仍能改变比赛节奏。短板在后防年龄,长传冲吊容易被针对。',
    generatedAt: new Date().toISOString(),
  },
  fra: {
    teamId: 'fra',
    strengths: ['锋线深度', '中场覆盖', '体能与速度优势'],
    weaknesses: ['中后卫稳定性', '门将位置存疑'],
    keyPlayers: ['基利安·姆巴佩', '楚阿梅尼', '马库斯·图拉姆'],
    championProb: 0.18,
    knockoutProb: 0.88,
    summary: '锋线火力强,姆巴佩状态决定上限。需关注新中卫组合的磨合。',
    generatedAt: new Date().toISOString(),
  },
  esp: {
    teamId: 'esp',
    strengths: ['控球节奏', '新一代中场的技术能力', '边路冲击'],
    weaknesses: ['中锋点欠缺一锤定音', '快速反击防守'],
    keyPlayers: ['拉明·亚马尔', '佩德里', '罗德里'],
    championProb: 0.14,
    knockoutProb: 0.92,
    summary: '年轻化重建后体系成熟,Tiki-Taka 2.0 阶段。亚马尔进攻端的灵感是夺冠级别变量。',
    generatedAt: new Date().toISOString(),
  },
};
