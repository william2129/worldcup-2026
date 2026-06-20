// 单独同步比分(更轻量,适合频繁运行)
import 'dotenv/config';
import { syncMatches } from '../src/lib/sync';

syncMatches()
  .then((r) => {
    console.log(`同步完成: 新增 ${r.inserted}, 更新 ${r.updated}, 新结束 ${r.finishedNew.length}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
