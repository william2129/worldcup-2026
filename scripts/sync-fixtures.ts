// 手动触发:同步赛程和球队
// 用法: npm run sync:fixtures
import 'dotenv/config';
import { syncTeams, syncMatches } from '../src/lib/sync';

async function main() {
  console.log('开始同步球队...');
  const teamsResult = await syncTeams();
  console.log(`球队同步完成: 新增 ${teamsResult.inserted}, 更新 ${teamsResult.updated}`);

  console.log('开始同步比赛...');
  const matchesResult = await syncMatches();
  console.log(`比赛同步完成: 新增 ${matchesResult.inserted}, 更新 ${matchesResult.updated}`);
  if (matchesResult.finishedNew.length > 0) {
    console.log(`本次新增 ${matchesResult.finishedNew.length} 场刚结束的比赛:`, matchesResult.finishedNew);
    console.log('建议运行 npm run predict:regenerate 重新生成后续预测');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('同步失败:', err);
    process.exit(1);
  });
