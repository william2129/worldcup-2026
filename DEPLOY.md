# 部署到 Vercel 完整指南

零成本,让朋友也能看你的世界杯预测网站。整个流程大约 15 分钟。

---

## 准备工作(只做一次)

### 1. 安装 Git

打开 https://git-scm.com/download/win 下载 Windows 版,一路 Next 装到底。

装完后在新的 PowerShell 里:

```powershell
git --version
```

显示版本号说明 OK。

### 2. 注册 GitHub 账号

如果还没有,去 https://github.com/signup 注册一个。

### 3. 注册 Vercel 账号

去 https://vercel.com/signup ,**直接选"Continue with GitHub"** 用 GitHub 账号登录,不用单独注册。

---

## 第一次部署(只做一次)

### 第一步:在本地初始化 Git 仓库

在项目目录跑(打开新的 PowerShell):

```powershell
cd F:\世界杯预测2026

# 初始化
git init
git branch -M main

# 配置作者信息(第一次必须)
git config user.email "你的GitHub邮箱"
git config user.name "你的GitHub用户名"

# 提交所有文件
git add .
git commit -m "feat: 2026 世界杯 AI 预测平台初版"
```

### 第二步:在 GitHub 创建空仓库

1. 打开 https://github.com/new
2. **Repository name** 填 `worldcup-2026`(或者你喜欢的名字)
3. **不要勾选** Add a README / .gitignore / license(因为本地已经有了)
4. 点 **Create repository**

创建后页面上会显示几行命令,**只关心 "push an existing repository" 那段**,大概长这样:

```bash
git remote add origin https://github.com/你的用户名/worldcup-2026.git
git push -u origin main
```

把这两行**复制粘贴**到你的 PowerShell 里执行。

> 第一次 push 会让你登录 GitHub,弹出浏览器窗口确认即可。

完成后,刷新 GitHub 仓库页面应该能看到所有文件。

### 第三步:在 Vercel 导入项目

1. 打开 https://vercel.com/new
2. 左边列出你 GitHub 的所有仓库,找到 `worldcup-2026` 点 **Import**
3. 进入配置页面:
   - **Framework Preset**: 自动识别为 Next.js ✅
   - **Root Directory**: `./` 保持默认
   - **Build Command**: `next build` 保持默认
   - 展开 **Environment Variables**,加一条:
     - Name: `FOOTBALL_DATA_API_KEY`
     - Value: `a89c70d59cb94dd5805cc8ea81374728`
4. 点 **Deploy**

等 2-3 分钟,显示烟花动画就代表成功。

你会拿到一个 `worldcup-2026-xxx.vercel.app` 这样的网址,这就是你的网站,可以发给任何人看。

---

## 日常使用(每天 1-2 分钟)

部署完之后,网站的内容怎么更新?

### 场景 A:更新真实赛程和比分

每天比赛打完后,跟我说:

> 帮我拉最新数据并推送上线

我会:
1. 跑 `npm run data:fetch` + `npm run data:build` 拉 football-data.org 最新数据
2. 跑 `git add . && git commit -m "data: 更新比分 2026-06-xx"`
3. 跑 `git push`
4. Vercel 自动检测到 push,1-2 分钟后网站就更新了

### 场景 B:重新生成 AI 预测

每天比赛打完后,跟我说:

> 根据最新比分重新预测

我会:
1. 先拉最新数据(同上)
2. 读取所有已结束比赛的真实结果
3. 重新生成 `data/match-predictions.json` 和 `data/match-analysis-detail.json`
4. git commit + push
5. Vercel 自动重新部署

### 场景 C:小组赛全部结束后,生成淘汰赛预测

> 小组赛打完了,根据出线情况生成淘汰赛对阵和预测

我会:
1. 拉最新数据(此时 API 会返回淘汰赛的对阵)
2. 重新生成所有未踢比赛的预测
3. 部署上线

---

## 常见问题

### Q: Vercel 免费够用吗?
完全够。Hobby 计划每月 100GB 流量,你这个站静态化后,1000 个朋友访问也用不到 1GB。

### Q: API key 暴露在 GitHub 上安全吗?
**不要直接 commit `.env.local`**,我已经在 `.gitignore` 里排除了。Vercel 上的环境变量通过 Vercel 后台配置,不暴露。

### Q: 我能买个自己的域名吗?
能。Vercel 项目设置里 Domains → Add 域名。常见域名注册商 namecheap、cloudflare、阿里云均可。

### Q: 同步数据用付费 API 会不会限速?
football-data.org 免费层 10 次/分钟,我们的同步频率(每天几次)远远低于上限,完全没问题。

### Q: 部署后能本地继续开发吗?
能。本地 `npm run dev` 看,觉得 OK 后 `git push` 上线。两套是分开的。

---

## 如果遇到问题

部署失败 / git push 失败 / Vercel 报错,直接把错误信息告诉我,我帮你排查。
