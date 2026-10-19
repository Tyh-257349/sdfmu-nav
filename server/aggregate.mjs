// 数据聚合服务：抓取学校官网通知公告、学术动态和就业平台招聘信息
// 由 vite.config.ts 以中间件方式挂载到 /api/*，带 5 分钟内存缓存

const CACHE_TTL = 5 * 60 * 1000
const cache = new Map()

const UA = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
}

async function cached(key, producer) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.time < CACHE_TTL) return hit.data
  const data = await producer()
  cache.set(key, { time: Date.now(), data })
  return data
}

// 解析官网列表页（通知公告 / 学术动态同款结构）
function parseListPage(html, base) {
  const items = []
  const re =
    /<a href="(\.\.\/info\/[^"]+)" title="([^"]+)"[^>]*>\s*<div class="date">\s*<span>(\d+)<\/span>\s*<span>([\d-]+)<\/span>/g
  let m
  while ((m = re.exec(html)) !== null) {
    items.push({
      title: m[2].trim(),
      url: new URL(m[1], base).href,
      date: `${m[4]}-${m[3].padStart(2, '0')}`,
    })
    if (items.length >= 20) break
  }
  // 官网列表前列为置顶，统一按日期倒序，保证最新在前
  items.sort((a, b) => (a.date < b.date ? 1 : -1))
  return items.slice(0, 12)
}

// 解析官网首页「通知公告」栏目（官网列表页长期停更，首页栏目才是实时源）
function parseHomeNotices(html) {
  const block = html.match(/<ul class="tz-ul[\s\S]*?<\/ul>/)?.[0] ?? ''
  const items = []
  const re =
    /<a href="([^"]+)"[^>]*>\s*<div class="one-lb-date[^"]*">(\d{4})<br><span>(\d{2})\.(\d{2})<\/span><\/div>\s*<p>([^<]+)<\/p>/g
  let m
  while ((m = re.exec(block)) !== null) {
    items.push({
      title: m[5].trim(),
      url: m[1],
      date: `${m[2]}-${m[3]}-${m[4]}`,
    })
  }
  // 前两条为官网置顶，按日期倒序保证最新在前
  items.sort((a, b) => (a.date < b.date ? 1 : -1))
  return items
}

async function fetchNotices() {
  const res = await fetch('https://www.sdfmu.edu.cn/index.htm', { headers: UA })
  if (!res.ok) throw new Error(`官网响应 ${res.status}`)
  return parseHomeNotices(await res.text())
}

// 抓取官网栏目列表页（学术动态等）
async function fetchListPage(pathname) {
  const base = `https://www.sdfmu.edu.cn/index/${pathname}.htm`
  const res = await fetch(base, { headers: UA })
  if (!res.ok) throw new Error(`官网响应 ${res.status}`)
  const html = await res.text()
  return parseListPage(html, base)
}

async function postEmployment(api, body) {
  const res = await fetch(`https://school.gxjy.sdei.edu.cn/sdfmu/front/api/${api}`, {
    method: 'POST',
    headers: {
      ...UA,
      'content-type': 'application/json',
      referer: 'https://school.gxjy.sdei.edu.cn/sdfmu',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`就业平台响应 ${res.status}`)
  const json = await res.json()
  if (json.code !== 0) throw new Error(`就业平台错误 ${json.code}`)
  return json.data ?? []
}

function monthRange(offsetMonths = 0) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0)
  const f = (d) => d.toISOString().slice(0, 10)
  return { start: f(start), end: f(end) }
}

// 教务部「教务公告」栏目（columnId=256）
async function fetchJwc() {
  const base =
    'https://jwc.sdfmu.edu.cn/homepagenew/infoArticleList.do?columnId=256'
  const res = await fetch(base, { headers: UA })
  if (!res.ok) throw new Error(`教务部响应 ${res.status}`)
  const html = await res.text()
  const items = []
  const re =
    /<a href="(infoSingleArticle\.do\?articleId=\d+&columnId=256)"[^>]*>\s*([^<]+?)\s*<\/a><span>([\d-]+)<\/span>/g
  let m
  while ((m = re.exec(html)) !== null) {
    items.push({
      title: m[2].trim(),
      url: new URL(m[1], base).href,
      date: m[3],
    })
    if (items.length >= 12) break
  }
  return items
}

// 学生工作部「通知公告」栏目
async function fetchSa() {
  const base = 'https://sa.sdfmu.edu.cn/index/tzgg.htm'
  const res = await fetch(base, { headers: UA })
  if (!res.ok) throw new Error(`学工部响应 ${res.status}`)
  const html = await res.text()
  const items = []
  const re =
    /<a href="(\.\.\/info\/[^"]+)" title="([^"]+)"[^>]*>\s*<div class="tx-date">\s*<span>(\d{2})-(\d{2})<\/span>\s*<b>(\d{4})<\/b>/g
  let m
  while ((m = re.exec(html)) !== null) {
    items.push({
      title: m[2].trim(),
      url: new URL(m[1], base).href,
      date: `${m[5]}-${m[3]}-${m[4]}`,
    })
    if (items.length >= 12) break
  }
  return items
}

// 医学信息与人工智能学院官网首页「通知公告」板块
async function fetchAims() {
  const base = 'https://aims.sdfmu.edu.cn/'
  const res = await fetch(base, { headers: UA })
  if (!res.ok) throw new Error(`学院官网响应 ${res.status}`)
  const html = await res.text()
  const block = html.match(/<div class="tz_box">[\s\S]*?<\/ul>/)?.[0] ?? ''
  const items = []
  const re =
    /<li><span>(\d+)<p>(\d{4}-\d{2})<\/p><\/span><a href="(info\/[^"]+)"[^>]*title="([^"]+)"/g
  let m
  while ((m = re.exec(block)) !== null) {
    items.push({
      title: m[4].trim(),
      url: new URL(m[3], base).href,
      date: `${m[2]}-${m[1].padStart(2, '0')}`,
    })
    if (items.length >= 12) break
  }
  return items
}

async function fetchJobs() {
  const [jobs, fairs, careerFairs] = await Promise.all([
    postEmployment('jobs', {}),
    postEmployment('jobfairs', { ...monthRange(), jobfairtype: 1 }),
    postEmployment('careerfairs', { ...monthRange() }),
  ])
  return {
    jobs: jobs.slice(0, 10).map((j) => ({
      title: `${j.companyName} — ${j.jobsort2}`,
      meta: [
        j.basewage ? `薪资 ${j.basewage}` : '',
        j.specialty ? `专业 ${j.specialty}` : '',
        j.createtime ? String(j.createtime).slice(0, 10) : '',
      ]
        .filter(Boolean)
        .join(' · '),
    })),
    fairs: [
      ...fairs.map((f) => ({
        title: f.jobfairname,
        time: String(f.starttime ?? '').slice(0, 16),
        kind: '双选会',
      })),
      ...careerFairs.map((f) => ({
        title: f.fairName,
        time: String(f.fairStartTime ?? '').slice(0, 16),
        kind: f.fairType ?? '宣讲会',
      })),
    ]
      .sort((a, b) => (a.time < b.time ? -1 : 1))
      .slice(0, 10),
  }
}

const ROUTES = {
  '/api/notices': () => cached('notices', fetchNotices),
  '/api/jwc': () => cached('jwc', fetchJwc),
  '/api/sa': () => cached('sa', fetchSa),
  '/api/aims': () => cached('aims', fetchAims),
  '/api/talks': () => cached('talks', () => fetchListPage('kxyj')),
  '/api/jobs': () => cached('jobs', fetchJobs),
}

// 供 scripts/crawl.mjs 在 CI 里离线复用同一套抓取逻辑（写 public/api/*.json）
export const FETCHERS = {
  notices: fetchNotices,
  jwc: fetchJwc,
  sa: fetchSa,
  aims: fetchAims,
  talks: () => fetchListPage('kxyj'),
  jobs: fetchJobs,
}

export function aggregationMiddleware(req, res, next) {
  const route = Object.keys(ROUTES).find((p) => req.url?.startsWith(p))
  if (!route) return next()
  res.setHeader('content-type', 'application/json; charset=utf-8')
  ROUTES[route]()
    .then((data) => {
      res.end(JSON.stringify({ ok: true, time: new Date().toISOString(), data }))
    })
    .catch((err) => {
      res.statusCode = 502
      res.end(JSON.stringify({ ok: false, error: String(err.message ?? err) }))
    })
}
