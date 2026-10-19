import { useParams } from 'react-router'
import { Eye } from 'lucide-react'
import { BackButton } from '@/components/CategoryCard'
import LinkSection from '@/components/LinkSection'
import Favorites from '@/components/Favorites'
import { campusGroups, outsideGroups } from '@/data/links'
import { usePersistent } from '@/lib/store'

export default function GroupPage({
  scope,
}: {
  scope: 'campus' | 'outside'
}) {
  const { groupId } = useParams<{ groupId: string }>()
  const groups = scope === 'campus' ? campusGroups : outsideGroups
  const group = groups.find((g) => g.id === groupId)

  const [orders, setOrders] = usePersistent<Record<string, string[]>>(
    `sdfmu-orders-${scope}`,
    {},
  )
  const [hiddenIds, setHiddenIds] = usePersistent<string[]>(
    `sdfmu-hidden-${scope}`,
    [],
  )

  if (groupId === 'favorites' && scope === 'outside') {
    return (
      <div>
        <BackButton to="/outside" label="返回校外资源" />
        <Favorites />
      </div>
    )
  }

  if (!group) {
    return (
      <div>
        <BackButton to={`/${scope}`} label="返回上级" />
        <p className="text-sm text-muted-foreground">没有这个分类。</p>
      </div>
    )
  }

  const hiddenSet = group.links.filter((l) => hiddenIds.includes(l.id))

  return (
    <div className="group-page">
      <BackButton to={`/${scope}`} label={scope === 'campus' ? '返回校内服务' : '返回校外资源'} />
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold tracking-[0.1px]">{group.title}</h1>
        <span className="text-[10px] tracking-[1px] text-muted-foreground uppercase">
          {group.subtitle}
        </span>
      </div>
      <p className="mb-8 text-xs leading-[135%] tracking-[0.1px] text-muted-foreground">
        每一行都标注了「里面有什么」。悬停行尾可隐藏，拖拽左侧手柄可调整顺序，设置保存在本机浏览器。
      </p>

      <LinkSection
        group={group}
        order={orders[group.id] ?? group.links.map((l) => l.id)}
        hiddenIds={hiddenIds}
        onReorder={(gid, newOrder) =>
          setOrders((prev) => ({ ...prev, [gid]: newOrder }))
        }
        onToggleHide={(id) =>
          setHiddenIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          )
        }
      />

      {hiddenSet.length > 0 && (
        <section className="mt-4 border-t pt-4">
          <h3 className="mb-2 text-xs font-medium tracking-[1px] text-muted-foreground uppercase">
            已隐藏的入口
          </h3>
          <div className="flex flex-wrap gap-2">
            {hiddenSet.map((l) => (
              <button
                key={l.id}
                onClick={() =>
                  setHiddenIds((prev) => prev.filter((x) => x !== l.id))
                }
                className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Eye className="h-3 w-3" />
                {l.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {group.extra && (
        <section className="mt-8 border-t pt-6">
          <h2 className="mb-2 text-lg font-semibold tracking-[0.1px]">
            {group.extra.title}
          </h2>
          <p className="mb-4 text-xs leading-[160%] tracking-[0.1px] text-muted-foreground">
            {group.extra.intro}
          </p>
          <ol className="columns-2 gap-8 text-xs leading-[180%] tracking-[0.1px] sm:columns-3">
            {group.extra.items.map((item, i) => (
              <li key={i} className="break-inside-avoid">
                {i + 1}. {item}
              </li>
            ))}
          </ol>
          {group.extra.source && group.extra.sourceUrl && (
            <p className="mt-4 text-xs text-muted-foreground">
              名单来源：
              <a
                href={group.extra.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                {group.extra.source}
              </a>
            </p>
          )}
        </section>
      )}
    </div>
  )
}
