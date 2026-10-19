import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiUrl } from '@/lib/api'

interface ListItem {
  title: string
  url?: string
  date?: string
  time?: string
  kind?: string
  meta?: string
}

interface JobsData {
  jobs: ListItem[]
  fairs: ListItem[]
}

function Panel({
  title,
  subtitle,
  sourceUrl,
  items,
  loading,
  error,
  onRefresh,
  footer,
}: {
  title: string
  subtitle: string
  sourceUrl?: string
  items: ListItem[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  footer?: string
}) {
  return (
    <section className="live-panel flex flex-col rounded-md border">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 items-center gap-1 text-sm font-medium hover:text-primary"
            title={`打开${title}来源网站`}
          >
            <span className="link-underline truncate">{title}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        ) : (
          <h3 className="truncate text-sm font-medium">{title}</h3>
        )}
        <span className="hidden text-[10px] tracking-[1px] text-muted-foreground uppercase sm:inline">
          {subtitle}
        </span>
        <button
          aria-label={`刷新${title}`}
          onClick={onRefresh}
          className="ml-auto rounded p-1 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex-1">
        {error && (
          <p className="px-3 py-4 text-xs text-muted-foreground">
            暂时抓不到数据（{error}），点右上角刷新重试
          </p>
        )}
        {!error && items.length === 0 && !loading && (
          <p className="px-3 py-4 text-xs text-muted-foreground">暂无内容</p>
        )}
        {items.map((it, i) => (
          <div
            key={i}
            className="group flex items-baseline gap-2 border-b px-3 py-2 last:border-b-0"
          >
            {it.date && (
              <span className="tnum w-[74px] shrink-0 text-[10px] text-muted-foreground">
                {it.date}
              </span>
            )}
            <div className="min-w-0 flex-1">
              {it.url ? (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline block truncate text-xs"
                >
                  {it.title}
                </a>
              ) : (
                <p className="truncate text-xs">{it.title}</p>
              )}
              {it.meta && (
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {it.meta}
                </p>
              )}
            </div>
            {it.kind && (
              <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                {it.kind}
              </span>
            )}
            {it.time && (
              <span className="tnum hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
                {it.time.slice(5, 16)}
              </span>
            )}
            {it.url && (
              <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>
        ))}
      </div>
      {footer && (
        <p className="border-t px-3 py-1.5 text-[10px] text-muted-foreground">
          {footer}
        </p>
      )}
    </section>
  )
}

async function getJson(url: string) {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.ok) throw new Error(json.error ?? 'unknown')
  return json
}

// 实时聚合：通知公告 / 学术讲座 / 招聘信息（由本地服务端抓取，缓存 5 分钟）
export default function LiveBoard() {
  const [notices, setNotices] = useState<ListItem[]>([])
  const [jwc, setJwc] = useState<ListItem[]>([])
  const [sa, setSa] = useState<ListItem[]>([])
  const [aims, setAims] = useState<ListItem[]>([])
  const [talks, setTalks] = useState<ListItem[]>([])
  const [jobsData, setJobsData] = useState<JobsData>({ jobs: [], fairs: [] })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [updatedAt, setUpdatedAt] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    const errs: Record<string, string | null> = {}
    const results = await Promise.allSettled([
      getJson(apiUrl('jwc')),
      getJson(apiUrl('sa')),
      getJson(apiUrl('aims')),
      getJson(apiUrl('notices')),
      getJson(apiUrl('talks')),
      getJson(apiUrl('jobs')),
    ])
    const pick = (i: number) =>
      results[i].status === 'fulfilled'
        ? (results[i] as PromiseFulfilledResult<{ data: never }>).value.data
        : null
    const jwcData = pick(0)
    if (jwcData) {
      setJwc(jwcData)
      setUpdatedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    } else errs.jwc = String((results[0] as PromiseRejectedResult).reason)
    const setters = [setSa, setAims, setNotices, setTalks]
    const keys = ['sa', 'aims', 'notices', 'talks']
    setters.forEach((set, k) => {
      const data = pick(k + 1)
      if (data) set(data)
      else errs[keys[k]] = String((results[k + 1] as PromiseRejectedResult).reason)
    })
    const jobsResult = pick(5)
    if (jobsResult) setJobsData(jobsResult)
    else errs.jobs = String((results[5] as PromiseRejectedResult).reason)
    setErrors(errs)
    setLoading(false)
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0)
    const t = setInterval(load, 30 * 60 * 1000) // 每 30 分钟自动刷新
    return () => { window.clearTimeout(initialLoad); clearInterval(t) }
  }, [load])

  return (
    <section className="live-board mt-4">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-[0.1px]">最新动态</h2>
        <span className="text-[10px] tracking-[1px] text-muted-foreground uppercase">
          Live
        </span>
        <span className="text-xs text-muted-foreground">
          实时抓取自学校官网与就业平台{updatedAt ? ` · 更新于 ${updatedAt}` : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 gap-1 text-xs"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          全部刷新
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Panel
          title="教务公告"
          subtitle="Academic Affairs"
          sourceUrl="https://jwc.sdfmu.edu.cn/homepagenew/indexold.do"
          items={jwc}
          loading={loading}
          error={errors.jwc ?? null}
          onRefresh={load}
          footer="来源：教务部网站教务公告栏"
        />
        <Panel
          title="学工公告"
          subtitle="Student Affairs"
          sourceUrl="https://sa.sdfmu.edu.cn/"
          items={sa}
          loading={loading}
          error={errors.sa ?? null}
          onRefresh={load}
          footer="来源：学生工作部通知公告栏"
        />
        <Panel
          title="学院公告"
          subtitle="College"
          sourceUrl="https://aims.sdfmu.edu.cn/"
          items={aims}
          loading={loading}
          error={errors.aims ?? null}
          onRefresh={load}
          footer="来源：医学信息与人工智能学院官网"
        />
        <Panel
          title="通知公告"
          subtitle="Notices"
          sourceUrl="https://www.sdfmu.edu.cn/"
          items={notices}
          loading={loading}
          error={errors.notices ?? null}
          onRefresh={load}
          footer="来源：学校官网首页通知公告栏"
        />
        <Panel
          title="学术讲座"
          subtitle="Talks"
          sourceUrl="https://www.sdfmu.edu.cn/index/kxyj.htm"
          items={talks}
          loading={loading}
          error={errors.talks ?? null}
          onRefresh={load}
          footer="来源：学校官网学术动态栏"
        />
        <Panel
          title="招聘与宣讲"
          subtitle="Career"
          sourceUrl="https://school.gxjy.sdei.edu.cn/sdfmu"
          items={jobsData.fairs}
          loading={loading}
          error={errors.jobs ?? null}
          onRefresh={load}
          footer={`另有 ${jobsData.jobs.length} 条最新招聘岗位，见就业服务平台`}
        />
      </div>
    </section>
  )
}
