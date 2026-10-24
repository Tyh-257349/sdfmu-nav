// 定时抓取脚本（GitHub Actions 用）：抓六类公告，写 public/api/*.json
// 与本地开发共用 server/aggregate.mjs 的抓取逻辑。
// 某个源失败时保留旧数据（首次失败则写一个 ok:false 占位），不中断整体。

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { FETCHERS } from '../server/aggregate.mjs'

const outDir = new URL('../public/api/', import.meta.url)
await mkdir(outDir, { recursive: true })

let failed = 0

// 校园网 DNS 不稳定：失败时等 2s/4s 重试，共 3 次
async function withRetry(fn, tries = 3) {
  let last
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (err) {
      last = err
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  throw last
}

for (const [name, fetcher] of Object.entries(FETCHERS)) {
  const file = new URL(`${name}.json`, outDir)
  try {
    const data = await withRetry(fetcher)
    await writeFile(
      file,
      JSON.stringify({ ok: true, time: new Date().toISOString(), data }),
    )
    const count = Array.isArray(data) ? data.length : 'obj'
    console.log(`ok   ${name} (${count})`)
  } catch (err) {
    failed += 1
    console.warn(`fail ${name}: ${err.message ?? err}`)
    try {
      await readFile(file) // 有旧数据就保留
    } catch {
      await writeFile(
        file,
        JSON.stringify({ ok: false, error: String(err.message ?? err) }),
      )
    }
  }
}

console.log(failed === 0 ? 'all sources ok' : `${failed} source(s) failed, old data kept`)
