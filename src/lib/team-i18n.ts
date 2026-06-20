// 48 支 2026 世界杯球队的中文名 + ISO 国家代码映射
// key: football-data.org 的 TLA(三字母缩写)

export interface TeamI18n {
  name: string;       // 中文名
  countryCode: string; // ISO alpha-2 (用于 flagcdn)
}

export const TEAM_I18N: Record<string, TeamI18n> = {
  // Group A
  MEX: { name: '墨西哥', countryCode: 'mx' },
  KOR: { name: '韩国', countryCode: 'kr' },
  CZE: { name: '捷克', countryCode: 'cz' },
  RSA: { name: '南非', countryCode: 'za' },
  // Group B
  CAN: { name: '加拿大', countryCode: 'ca' },
  SUI: { name: '瑞士', countryCode: 'ch' },
  BIH: { name: '波黑', countryCode: 'ba' },
  QAT: { name: '卡塔尔', countryCode: 'qa' },
  // Group C
  MAR: { name: '摩洛哥', countryCode: 'ma' },
  SCO: { name: '苏格兰', countryCode: 'gb-sct' },
  BRA: { name: '巴西', countryCode: 'br' },
  HAI: { name: '海地', countryCode: 'ht' },
  // Group D
  USA: { name: '美国', countryCode: 'us' },
  AUS: { name: '澳大利亚', countryCode: 'au' },
  TUR: { name: '土耳其', countryCode: 'tr' },
  PAR: { name: '巴拉圭', countryCode: 'py' },
  // Group E
  GER: { name: '德国', countryCode: 'de' },
  CIV: { name: '科特迪瓦', countryCode: 'ci' },
  ECU: { name: '厄瓜多尔', countryCode: 'ec' },
  CUW: { name: '库拉索', countryCode: 'cw' },
  // Group F
  SWE: { name: '瑞典', countryCode: 'se' },
  JPN: { name: '日本', countryCode: 'jp' },
  NED: { name: '荷兰', countryCode: 'nl' },
  TUN: { name: '突尼斯', countryCode: 'tn' },
  // Group G
  NZL: { name: '新西兰', countryCode: 'nz' },
  IRN: { name: '伊朗', countryCode: 'ir' },
  BEL: { name: '比利时', countryCode: 'be' },
  EGY: { name: '埃及', countryCode: 'eg' },
  // Group H
  URU: { name: '乌拉圭', countryCode: 'uy' },
  KSA: { name: '沙特阿拉伯', countryCode: 'sa' },
  ESP: { name: '西班牙', countryCode: 'es' },
  CPV: { name: '佛得角', countryCode: 'cv' },
  // Group I
  NOR: { name: '挪威', countryCode: 'no' },
  FRA: { name: '法国', countryCode: 'fr' },
  SEN: { name: '塞内加尔', countryCode: 'sn' },
  IRQ: { name: '伊拉克', countryCode: 'iq' },
  // Group J
  ARG: { name: '阿根廷', countryCode: 'ar' },
  AUT: { name: '奥地利', countryCode: 'at' },
  JOR: { name: '约旦', countryCode: 'jo' },
  ALG: { name: '阿尔及利亚', countryCode: 'dz' },
  // Group K
  COL: { name: '哥伦比亚', countryCode: 'co' },
  COD: { name: '刚果（金）', countryCode: 'cd' },
  POR: { name: '葡萄牙', countryCode: 'pt' },
  UZB: { name: '乌兹别克斯坦', countryCode: 'uz' },
  // Group L
  ENG: { name: '英格兰', countryCode: 'gb-eng' },
  GHA: { name: '加纳', countryCode: 'gh' },
  PAN: { name: '巴拿马', countryCode: 'pa' },
  CRO: { name: '克罗地亚', countryCode: 'hr' },
};

export function lookupTeamI18n(tla: string, fallbackName: string): TeamI18n {
  return TEAM_I18N[tla] ?? { name: fallbackName, countryCode: tla.slice(0, 2).toLowerCase() };
}

// 阶段中文
export const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: '小组赛',
  LAST_32: '1/16 决赛',
  LAST_16: '1/8 决赛',
  QUARTER_FINALS: '1/4 决赛',
  SEMI_FINALS: '半决赛',
  THIRD_PLACE: '季军赛',
  FINAL: '决赛',
};
