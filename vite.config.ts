import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function aggregationApi(): Plugin {
  const attach = async (server: {
    middlewares: { use: (fn: never) => void }
  }) => {
    // @ts-expect-error 本地 .mjs 聚合服务无类型声明
    const { aggregationMiddleware } = await import('./server/aggregate.mjs')
    server.middlewares.use(aggregationMiddleware as never)
  }
  return {
    name: 'sdfmu-aggregation-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目页挂在 /<repo>/ 子路径下，用 GH_PAGES_BASE 指定；本地保持相对路径
  base: process.env.GH_PAGES_BASE ?? './',
  plugins: [inspectAttr(), react(), aggregationApi()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

// touch 1792331388

// touch 1792331533

// touch 1792331721

// touch 1792332325

// touch 1792376761

// touch 1792378898

// touch 1792382201

// touch 1792382507

// touch 1792382773

// touch 1792384627
