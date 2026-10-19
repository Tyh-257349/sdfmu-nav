import { useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { campusGroups, outsideGroups, type LinkItem } from '@/data/links'
import { useNavigate } from 'react-router'

interface FlatLink extends LinkItem {
  groupTitle: string
  scope: '校内' | '校外'
  route: string
}

function flatten(): FlatLink[] {
  const campus = campusGroups.flatMap((g) =>
    g.links.map((l) => ({ ...l, groupTitle: g.title, scope: '校内' as const, route: `/campus/${g.id}` })),
  )
  const outside = outsideGroups.flatMap((g) =>
    g.links.map((l) => ({ ...l, groupTitle: g.title, scope: '校外' as const, route: `/outside/${g.id}` })),
  )
  return [...campus, ...outside]
}

export default function SearchDialog({
  open,
  onOpenChange,
  initialQuery = '',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const all = useMemo(() => flatten(), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((l) =>
      [l.name, l.desc, l.groupTitle, l.scope, ...(l.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [query, all])

  const openResult = (link: FlatLink) => {
    if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer')
    else navigate(link.route)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="search-dialog top-[18%] max-h-[70vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">全局搜索</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            aria-label="输入搜索关键词"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results.length ? `search-result-${selected}` : undefined}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                const next = (selected + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % Math.max(results.length, 1)
                setSelected(next)
                document.getElementById(`search-result-${next}`)?.scrollIntoView({ block: 'nearest' })
              }
              if (event.key === 'Enter' && results[selected]) { event.preventDefault(); openResult(results[selected]) }
            }}
            placeholder="输入关键词：成绩、选课、知网、座位预约…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div id="search-results" role="listbox" aria-label="搜索结果" className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              没有找到匹配的功能，换个关键词试试
            </p>
          )}
          {results.map((l, index) => (
            <button
              key={l.id}
              id={`search-result-${index}`}
              role="option"
              aria-selected={index === selected}
              data-selected={index === selected}
              onMouseMove={() => setSelected(index)}
              onClick={() => openResult(l)}
              className="group flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="link-underline truncate text-sm font-medium">
                    {l.name}
                  </span>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] tracking-[0.5px] text-muted-foreground">
                    {l.scope} · {l.groupTitle}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-[135%] text-muted-foreground">
                  {l.url ? l.desc : l.note ?? l.desc}
                </p>
              </div>
              {l.url ? (
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              ) : (
                <span className="mt-1 shrink-0 text-[10px] text-muted-foreground">
                  见说明
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="border-t px-4 py-2 text-[10px] tracking-[0.5px] text-muted-foreground">
          共 {results.length} 个功能 · 回车打开选中链接
        </div>
      </DialogContent>
    </Dialog>
  )
}
