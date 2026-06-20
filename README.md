# 2026 世界杯 AI 预测展示平台

基于 Next.js 15 + TypeScript + Tailwind CSS 的展示型平台,聚合 2026 世界杯赛程、比分,并由 AI 给出比分预测与战术分析。

## 项目结构

```
src/
  app/                  Next.js App Router 页面
    page.tsx            首页 - 赛程总览
    match/[id]/         单场比赛详情 + AI 预测
    groups/             小组赛积分榜
    bracket/            淘汰赛对阵图
    teams/              球队列表
    team/[id]/          球队详情
  components/           可复用组件
    flag.tsx            国旗(flagcdn.com)
    match-card.tsx      比赛卡片
    probability-bar.tsx 三方概率条
    section-header.tsx  段落头
  lib/
    types.ts            领域类型
    mock.ts             开发用 mock 数据
    data.ts             数据访问层(目前指向 mock,后续切换至 DB)
    football-data.ts    football-data.org API 客户端
    sync.ts             数据同步逻辑
    predict/            AI 预测模块(可插拔 provider)
      provider.ts       接口定义
      manual-provider.ts 由 Claude Code 手动生成
      index.ts          工厂入口
  db/
    schema.ts           Drizzle ORM schema
    client.ts           Neon 客户端
scripts/
  sync-fixtures.ts      球队+赛程同步脚本
  sync-scores.ts        比分同步脚本
  regenerate-predictions.ts  预测重算入口
data/                   AI 预测生成的 JSON(开发期由 Claude Code 写入)
```

## 启动方式

### 1. 安装依赖

```powershell
npm install
```

> 如果在中国大陆且网络较慢,先切换镜像:
>
> ```powershell
> npm config set registry https://registry.npmmirror.com
> ```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`,填入:

- `FOOTBALL_DATA_API_KEY` - 已填,来自 https://www.football-data.org/
- `DATABASE_URL` - 去 https://console.neon.tech 创建免费项目,复制连接串过来

不配 `DATABASE_URL` 也能跑,会用 `src/lib/mock.ts` 提供占位数据。

### 3. 启动开发

```powershell
npm run dev
```

打开 http://localhost:3000

### 4. 初始化数据库(配置好 DATABASE_URL 后)

```powershell
npm run db:push          # 把 schema 推到 Neon
npm run sync:fixtures    # 拉取球队 + 赛程
```

### 5. 定期同步比分

可以本地用 Windows 任务计划程序,或部署后用 Vercel Cron(每 10 分钟):

```powershell
npm run sync:scores
```

## AI 预测如何更新

由于不在生产环境调用付费 LLM,预测由 **Claude Code 开发会话**直接生成:

1. 每天开始 / 一场比赛踢完后,跟 Claude Code 说:"**根据最新的比分重新预测**"
2. Claude Code 会读取 `data/match-predictions.json`、参考最新 DB 状态,重写预测数据
3. 运行 `npx tsx scripts/regenerate-predictions.ts sync` 把 JSON 同步到 DB
4. 页面下次访问即看到新预测

后续若想接 DeepSeek 或 Anthropic API 实现全自动,只需在 `src/lib/predict/` 增加新 provider 并设置 `PREDICTION_PROVIDER=deepseek` 环境变量。

## 部署到 Vercel

1. 把代码推到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量(`FOOTBALL_DATA_API_KEY`、`DATABASE_URL`)
4. 在 `vercel.json` 配置 Cron(可选)

## 视觉风格

深色体育站风,主色 `#06090a`(背景)/ `#22c55e`(强调绿)/ `#fbbf24`(金色)。
字体:Display 用 Oswald(英文)+ PingFang/微软雅黑(中文)。
