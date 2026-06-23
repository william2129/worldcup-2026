// 拉取 football-data.org 原始数据保存到 data/raw/
import { config } from 'dotenv';
config({ path: '.env.local' });
config(); // 兜底 .env
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.FOOTBALL_DATA_API_KEY;
const RAW_DIR = path.join(process.cwd(), 'data', 'raw');

async function fetchJson(url: string): Promise<string> {
  if (!KEY) throw new Error('FOOTBALL_DATA_API_KEY 未配置');
  const res = await fetch(url, { headers: { 'X-Auth-Token': KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });
  const base = 'https://api.football-data.org/v4/competitions/WC';

  console.log('拉取 matches...');
  const matches = await fetchJson(`${base}/matches`);
  await writeFile(path.join(RAW_DIR, 'matches.json'), matches, 'utf-8');

  await sleep(7000); // 防限流

  console.log('拉取 teams...');
  const teams = await fetchJson(`${base}/teams`);
  await writeFile(path.join(RAW_DIR, 'teams.json'), teams, 'utf-8');

  await sleep(7000);

  console.log('拉取 standings...');
  const standings = await fetchJson(`${base}/standings`);
  await writeFile(path.join(RAW_DIR, 'standings.json'), standings, 'utf-8');

  console.log('完成');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
