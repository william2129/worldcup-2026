// Neon serverless 连接 + Drizzle 客户端
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const url = process.env.DATABASE_URL;

// 允许 DATABASE_URL 暂未配置:仍能跑 dev(mock 模式)
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  if (!url) {
    throw new Error(
      'DATABASE_URL 未配置。在 https://console.neon.tech 创建项目后,把连接串填进 .env.local',
    );
  }
  const client = neon(url);
  _db = drizzle(client, { schema });
  return _db;
}

export type DB = ReturnType<typeof getDb>;
export { schema };
