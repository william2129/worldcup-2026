// 触发预测重算 - 由用户在 Claude Code 会话中要求"重新预测"时调用
//
// 流程:
// 1. 从 DB 读取所有比赛 + 已完成比赛的结果
// 2. 输出一份"上下文摘要"到 stdout,内容是给 Claude Code 看的提示
// 3. Claude Code 接到后,直接调用 upsertManualMatchPrediction 写入预测
//
// 也支持读取 data/match-predictions.json 后批量同步到 DB
import 'dotenv/config';
import { getDb, schema } from '../src/db/client';
import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function syncJsonToDb() {
  const file = path.join(process.cwd(), 'data', 'match-predictions.json');
  let raw: string;
  try {
    raw = await readFile(file, 'utf-8');
  } catch {
    console.log('没有找到 data/match-predictions.json,跳过');
    return;
  }
  const map = JSON.parse(raw) as Record<string, {
    homeScore: number;
    awayScore: number;
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    confidence: number;
    reasoning: string;
    generatedAt: string;
    generatedBy: string;
  }>;

  const db = getDb();
  let updated = 0;
  for (const [matchId, pred] of Object.entries(map)) {
    await db
      .insert(schema.predictions)
      .values({ matchId, ...pred, generatedAt: new Date(pred.generatedAt) })
      .onConflictDoUpdate({
        target: schema.predictions.matchId,
        set: { ...pred, generatedAt: new Date(pred.generatedAt) },
      });

    // 历史快照
    await db.insert(schema.predictionHistory).values({
      id: `${matchId}_${Date.now()}`,
      matchId,
      ...pred,
      generatedAt: new Date(pred.generatedAt),
    });
    updated++;
  }
  console.log(`已将 ${updated} 条预测同步到 DB`);
}

async function dumpContext() {
  const db = getDb();
  const teams = await db.select().from(schema.teams);
  const matches = await db.select().from(schema.matches);
  const finished = matches.filter((m) => m.status === 'FINISHED');
  const upcoming = matches.filter((m) => m.status !== 'FINISHED' && m.status !== 'CANCELLED');

  console.log('=== 预测上下文(供 Claude Code 阅读) ===');
  console.log(`球队总数: ${teams.length}`);
  console.log(`已完成比赛: ${finished.length}`);
  console.log(`待预测比赛: ${upcoming.length}`);
  console.log('---');
  console.log('已完成比赛结果:');
  for (const m of finished) {
    console.log(`  ${m.id} [${m.groupId}] ${m.homeTeamId} ${m.homeScore}-${m.awayScore} ${m.awayTeamId}`);
  }
  console.log('---');
  console.log('待预测比赛:');
  for (const m of upcoming) {
    console.log(`  ${m.id} [${m.groupId}] ${m.homeTeamId} vs ${m.awayTeamId}  ${m.utcDate.toISOString()}`);
  }
}

async function main() {
  const mode = process.argv[2] ?? 'dump';
  if (mode === 'sync') {
    await syncJsonToDb();
  } else {
    await dumpContext();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
