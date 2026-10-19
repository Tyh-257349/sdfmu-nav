// 公告数据地址：本地开发走 vite 中间件 /api/*，GitHub Pages 走构建时打包的静态 JSON
const base = import.meta.env.BASE_URL

export function apiUrl(name: string): string {
  return base.startsWith('/') ? `${base}api/${name}.json` : `/api/${name}.json`
}
