// 从 The Odds API 拉取世界杯赔率,写入 data/market-odds.json
// 用法: npm run odds:fetch

import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fetchWorldCupOdds, aggregateMarketConsensus, type OddsApiEvent } from '../src/lib/predict/market-odds';
import type { MarketConsensus } from '../src/lib/types';

const API_KEY = process.env.ODDS_API_KEY;
if (!API_KEY) {
  console.error('ODDS_API_KEY 未配置,请在 .env.local 设置');
  process.exit(1);
}

interface InternalMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  utcDate: string;
  status: string;
}

interface InternalTeam {
  id: string;
  nameEn: string;
}

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  const teams: InternalTeam[] = JSON.parse(await readFile(path.join(dataDir, 'teams.json'), 'utf-8'));
  const matches: InternalMatch[] = JSON.parse(await readFile(path.join(dataDir, 'matches.json'), 'utf-8'));

  // nameEn (lowercase) → 内部 teamId
  const nameToId = new Map<string, string>();
  for (const t of teams) {
    nameToId.set(t.nameEn.toLowerCase(), t.id);
    // 别名
    if (t.nameEn === 'United States') {
      nameToId.set('united states', t.id);
      nameToId.set('usa', t.id);
    }
    if (t.nameEn === 'South Korea') {
      nameToId.set('south korea', t.id);
      nameToId.set('korea republic', t.id);
      nameToId.set('korea', t.id);
    }
    if (t.nameEn === 'Congo DR') {
      nameToId.set('congo dr', t.id);
      nameToId.set('dr congo', t.id);
      nameToId.set('democratic republic of the congo', t.id);
    }
    if (t.nameEn === 'Bosnia-Herzegovina') {
      nameToId.set('bosnia and herzegovina', t.id);
      nameToId.set('bosnia & herzegovina', t.id);
      nameToId.set('bosnia', t.id);
    }
    if (t.nameEn === 'Czechia') {
      nameToId.set('czech republic', t.id);
    }
    if (t.nameEn === 'Cape Verde Islands') {
      nameToId.set('cape verde', t.id);
    }
    if (t.nameEn === 'Curaçao' || t.nameEn === 'Cura莽ao') {
      nameToId.set('curacao', t.id);
      nameToId.set('curaçao', t.id);
    }
    if (t.nameEn === 'Saudi Arabia') {
      nameToId.set('saudi arabia', t.id);
    }
    if (t.nameEn === 'New Zealand') {
      nameToId.set('new zealand', t.id);
    }
    if (t.nameEn === 'South Africa') {
      nameToId.set('south africa', t.id);
    }
    if (t.nameEn === 'Ivory Coast') {
      nameToId.set('ivory coast', t.id);
      nameToId.set("côte d'ivoire", t.id);
    }
  }

  console.log('从 The Odds API 拉取赔率...');
  const events = await fetchWorldCupOdds(API_KEY!);
  console.log(`拿到 ${events.length} 场比赛的赔率`);

  // 用 (date + teamA + teamB) 匹配,不分主客顺序
  const matchByPair = new Map<string, InternalMatch>();
  for (const m of matches) {
    const date = m.utcDate.slice(0, 10);
    const sorted = [m.homeTeamId, m.awayTeamId].sort().join('_');
    matchByPair.set(`${date}_${sorted}`, m);
    // 同时也试日期 ±1 天(API 时区可能差异)
    const t = new Date(m.utcDate);
    const d1 = new Date(t.getTime() - 86400000).toISOString().slice(0, 10);
    const d2 = new Date(t.getTime() + 86400000).toISOString().slice(0, 10);
    matchByPair.set(`${d1}_${sorted}`, m);
    matchByPair.set(`${d2}_${sorted}`, m);
  }

  const out: Record<string, MarketConsensus> = {};
  const unmatched: OddsApiEvent[] = [];
  let matched = 0;
  for (const e of events) {
    const homeId = nameToId.get(e.home_team.toLowerCase());
    const awayId = nameToId.get(e.away_team.toLowerCase());
    if (!homeId || !awayId) {
      unmatched.push(e);
      continue;
    }
    const date = e.commence_time.slice(0, 10);
    const sorted = [homeId, awayId].sort().join('_');
    const m = matchByPair.get(`${date}_${sorted}`);
    if (!m) {
      unmatched.push(e);
      continue;
    }

    // 匹配成功,生成共识
    const cons = aggregateMarketConsensus(e);
    if (!cons) continue;

    // 如果 The Odds API 的 home_team 跟内部 home 一致,直接用;否则反转
    if (homeId === m.homeTeamId) {
      out[m.id] = cons;
    } else {
      out[m.id] = {
        ...cons,
        homeWinProb: cons.awayWinProb,
        awayWinProb: cons.homeWinProb,
      };
    }
    matched++;
  }

  await writeFile(path.join(dataDir, 'market-odds.json'), JSON.stringify(out, null, 2), 'utf-8');

  console.log(`\n匹配结果: ${matched}/${events.length} 场`);
  if (unmatched.length > 0) {
    console.log(`未匹配 ${unmatched.length} 场:`);
    for (const e of unmatched.slice(0, 10)) {
      console.log(`  ${e.commence_time.slice(0, 10)} ${e.home_team} vs ${e.away_team}`);
    }
  }
  console.log(`\n写入 data/market-odds.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
