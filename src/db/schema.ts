// Drizzle ORM schema - Neon Postgres
import { pgTable, text, integer, timestamp, real, uniqueIndex, index, jsonb } from 'drizzle-orm/pg-core';

export const teams = pgTable(
  'teams',
  {
    id: text('id').primaryKey(),                 // 内部短ID (例如 'arg')
    externalId: integer('external_id'),          // football-data.org id
    name: text('name').notNull(),                // 中文名
    nameEn: text('name_en').notNull(),
    countryCode: text('country_code').notNull(), // iso2 小写
    groupId: text('group_id'),                   // A-L
    crest: text('crest'),
    fifaRank: integer('fifa_rank'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    externalIdUniq: uniqueIndex('teams_external_id_uniq').on(t.externalId),
    groupIdx: index('teams_group_idx').on(t.groupId),
  }),
);

export const matches = pgTable(
  'matches',
  {
    id: text('id').primaryKey(),
    externalId: integer('external_id'),
    stage: text('stage').notNull(),
    groupId: text('group_id'),
    utcDate: timestamp('utc_date', { withTimezone: true }).notNull(),
    status: text('status').notNull(),
    matchday: integer('matchday'),
    homeTeamId: text('home_team_id').notNull().references(() => teams.id),
    awayTeamId: text('away_team_id').notNull().references(() => teams.id),
    homeScore: integer('home_score'),
    awayScore: integer('away_score'),
    venue: text('venue'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    externalIdUniq: uniqueIndex('matches_external_id_uniq').on(t.externalId),
    statusIdx: index('matches_status_idx').on(t.status),
    dateIdx: index('matches_date_idx').on(t.utcDate),
    groupIdx: index('matches_group_idx').on(t.groupId),
  }),
);

// 当前生效的预测 - 每场至多一条
export const predictions = pgTable(
  'predictions',
  {
    matchId: text('match_id').primaryKey().references(() => matches.id, { onDelete: 'cascade' }),
    homeScore: integer('home_score').notNull(),
    awayScore: integer('away_score').notNull(),
    homeWinProb: real('home_win_prob').notNull(),
    drawProb: real('draw_prob').notNull(),
    awayWinProb: real('away_win_prob').notNull(),
    confidence: real('confidence').notNull(),
    reasoning: text('reasoning').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    generatedBy: text('generated_by').notNull(), // 'claude-opus-4-7' 等
  },
);

// 预测历史快照 - 每次重算追加,用于"预测变化"和"准确率"
export const predictionHistory = pgTable(
  'prediction_history',
  {
    id: text('id').primaryKey(),               // ulid/uuid
    matchId: text('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
    homeScore: integer('home_score').notNull(),
    awayScore: integer('away_score').notNull(),
    homeWinProb: real('home_win_prob').notNull(),
    drawProb: real('draw_prob').notNull(),
    awayWinProb: real('away_win_prob').notNull(),
    confidence: real('confidence').notNull(),
    reasoning: text('reasoning').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    generatedBy: text('generated_by').notNull(),
    triggerEventMatchId: text('trigger_event_match_id'), // 触发本次重算的"刚结束"比赛
  },
  (t) => ({
    matchIdx: index('pred_history_match_idx').on(t.matchId),
    triggerIdx: index('pred_history_trigger_idx').on(t.triggerEventMatchId),
  }),
);

// 球队整体 AI 评估
export const teamAnalysis = pgTable(
  'team_analysis',
  {
    teamId: text('team_id').primaryKey().references(() => teams.id, { onDelete: 'cascade' }),
    strengths: jsonb('strengths').$type<string[]>().notNull(),
    weaknesses: jsonb('weaknesses').$type<string[]>().notNull(),
    keyPlayers: jsonb('key_players').$type<string[]>().notNull(),
    championProb: real('champion_prob').notNull(),
    knockoutProb: real('knockout_prob').notNull(),
    summary: text('summary').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    generatedBy: text('generated_by').notNull(),
  },
);

// 同步元数据 - 记录上次同步时间,避免频繁拉API
export const syncMeta = pgTable('sync_meta', {
  key: text('key').primaryKey(),               // 'fixtures' / 'teams' / 'scores'
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).notNull(),
  meta: jsonb('meta'),
});
