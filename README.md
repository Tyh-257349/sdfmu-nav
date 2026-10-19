# 山一大导航

山东第一医科大学学生自制导航站：校内服务、校外资源、最新动态，一站直达。

## 本地开发

```bash
npm install
npm run dev        # 开发服务器（含 /api 实时抓取中间件）
```

公告实时数据由 `server/aggregate.mjs` 抓取，开发时以 vite 中间件形式挂在 `/api/*`。

## 部署到 GitHub Pages

仓库需**命名为 `sdfmu-nav`**（部署路径为 `https://<用户名>.github.io/sdfmu-nav/`）。
若用其他仓库名，把 `.github/workflows/deploy.yml` 里的 `GH_PAGES_BASE` 改成 `/仓库名/`。

1. 在 GitHub 新建仓库 `sdfmu-nav`，把代码 push 到 `main` 分支：
   ```bash
   git init
   git add .
   git commit -m "init"
   git remote add origin git@github.com:<用户名>/sdfmu-nav.git
   git push -u origin main
   ```
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
3. push 会自动触发 `deploy.yml` 构建部署；`crawl.yml` 每 30 分钟抓取一次六类公告，
   把 `public/api/*.json` 提交回仓库，并再次触发部署，实现"最新动态"的准实时更新。

## 结构

- `src/data/links.ts` — 全部导航链接数据（校内分组 / 校外分组 / 白名单竞赛名单）
- `server/aggregate.mjs` — 公告抓取逻辑（本地中间件与 CI 共用）
- `scripts/crawl.mjs` — CI 定时抓取，写 `public/api/*.json`
- `.github/workflows/` — `deploy.yml`（构建部署）与 `crawl.yml`（定时抓取）
