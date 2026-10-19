import { useEffect, useState } from 'react'
import { ArrowUpRight, Radio } from 'lucide-react'
import { Link } from 'react-router'
import { apiUrl } from '@/lib/api'

interface PreviewItem {
  title: string
  url?: string
  date?: string
}

async function getData(url: string): Promise<PreviewItem[]> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.ok) throw new Error(json.error ?? 'unknown')
  return json.data
}

// 首页「最新动态」卡片：实时预览教务公告前几条，点击进 /live
export default function LivePreviewCard() {
  const [items, setItems] = useState<PreviewItem[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.allSettled([getData(apiUrl('jwc')), getData(apiUrl('sa'))]).then(
      ([jwc, sa]) => {
        if (!alive) return
        const merged = [
          ...(jwc.status === 'fulfilled' ? jwc.value.slice(0, 3) : []),
          ...(sa.status === 'fulfilled' ? sa.value.slice(0, 3) : []),
        ]
        if (merged.length === 0) setFailed(true)
        else setItems(merged.slice(0, 3))
      },
    )
    return () => {
      alive = false
    }
  }, [])

  return (
    <Link to="/live" className="portal-card portal-live">
      <div className="portal-top">
        <Radio size={25} strokeWidth={1.5} />
        <span>Live</span>
      </div>
      <h2>最新动态</h2>
      <div className="live-preview">
        {failed ? (
          <p className="live-preview-empty">
            实时抓取教务公告、学工公告、学院公告、讲座与招聘，进入查看全部
          </p>
        ) : items.length === 0 ? (
          <p className="live-preview-empty">正在抓取最新公告…</p>
        ) : (
          items.map((it, i) => (
            <span key={i} className="live-preview-row">
              {it.date && <time>{it.date.slice(5)}</time>}
              <span className="live-preview-title">{it.title}</span>
            </span>
          ))
        )}
      </div>
      <div className="portal-bottom">
        <span>实时抓取自各官方网站</span>
        <span className="portal-arrow">
          <ArrowUpRight size={20} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  )
}
