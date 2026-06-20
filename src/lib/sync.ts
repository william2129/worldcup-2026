// 数据同步逻辑:把 football-data.org 的数据写入本地 DB
import { eq } from 'drizzle-orm';
import { footballData, mapStatus } from './football-data';
import { getDb, schema } from '@/db/client';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** 全量同步球队(幂等,使用 external_id 作为去重键) */
export async function syncTeams() {
  const db = getDb();
  const { teams } = await footballData.listTeams();
  let inserted = 0;
  let updated = 0;

  for (const t of teams) {
    const id = slugify(t.tla || t.shortName || String(t.id));
    const existing = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.externalId, t.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.teams).values({
        id,
        externalId: t.id,
        name: t.shortName || t.name,        // 后续可加中文映射表
        nameEn: t.name,
        countryCode: (t.tla || '').slice(0, 2).toLowerCase() || 'xx',
        crest: t.crest,
      }).onConflictDoNothing();
      inserted++;
    } else {
      await db
        .update(schema.teams)
        .set({
          name: t.shortName || t.name,
          nameEn: t.name,
          crest: t.crest,
          updatedAt: new Date(),
        })
        .where(eq(schema.teams.externalId, t.id));
      updated++;
    }
  }

  await db
    .insert(schema.syncMeta)
    .values({ key: 'teams', lastSyncedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.syncMeta.key,
      set: { lastSyncedAt: new Date() },
    });

  return { inserted, updated, total: teams.length };
}

/** 全量同步比赛(更新比分和状态) */
export async function syncMatches() {
  const db = getDb();
  const { matches } = await footballData.listMatches();

  // 先把 external_id -> 内部 id 建好
  const dbTeams = await db.select().from(schema.teams);
  const extToId = new Map(dbTeams.filter((x) => x.externalId).map((x) => [x.externalId!, x.id]));

  let inserted = 0;
  let updated = 0;
  const finishedNew: string[] = []; // 本次同步中"新变成FINISHED"的比赛ID

  for (const m of matches) {
    const homeId = extToId.get(m.homeTeam.id);
    const awayId = extToId.get(m.awayTeam.id);
    if (!homeId || !awayId) continue;

    const id = `m_${m.id}`;
    const status = mapStatus(m.status);
    const existing = await db.select().from(schema.matches).where(eq(schema.matches.id, id)).limit(1);

    const values = {
      id,
      externalId: m.id,
      stage: m.stage,
      groupId: m.group ?? null,
      utcDate: new Date(m.utcDate),
      status,
      matchday: m.matchday,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      venue: m.venue ?? null,
    };

    if (existing.length === 0) {
      await db.insert(schema.matches).values(values);
      inserted++;
    } else {
      const prev = existing[0];
      if (prev.status !== 'FINISHED' && status === 'FINISHED') {
        finishedNew.push(id);
      }
      await db
        .update(schema.matches)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schema.matches.id, id));
      updated++;
    }
  }

  await db
    .insert(schema.syncMeta)
    .values({ key: 'matches', lastSyncedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.syncMeta.key,
      set: { lastSyncedAt: new Date() },
    });

  return { inserted, updated, total: matches.length, finishedNew };
}
