import { useRef } from 'react'
import { ArrowUpRight, EyeOff, GripVertical, MessageCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { LinkGroup } from '@/data/links'

interface Props {
  group: LinkGroup
  order: string[]
  hiddenIds: string[]
  onReorder: (groupId: string, newOrder: string[]) => void
  onToggleHide: (linkId: string) => void
}

// 目录式链接分组：行式排版、细分隔线、hover 下划线、可拖拽排序、可隐藏
export default function LinkSection({
  group,
  order,
  hiddenIds,
  onReorder,
  onToggleHide,
}: Props) {
  const dragIndex = useRef<number | null>(null)

  const links = order
    .map((id) => group.links.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
  // 新加入的数据若不在 order 中，追加在后面
  group.links.forEach((l) => {
    if (!order.includes(l.id)) links.push(l)
  })

  const visible = links.filter((l) => !hiddenIds.includes(l.id))
  const hiddenCount = links.length - visible.length

  return (
    <section className="link-section mb-12">
      <div className="mb-1 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold tracking-[0.1px]">{group.title}</h2>
        <span className="text-[10px] tracking-[1px] text-muted-foreground uppercase">
          {group.subtitle}
        </span>
        {hiddenCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            已隐藏 {hiddenCount} 个（在页面底部可恢复）
          </span>
        )}
      </div>
      <div className="border-t">
        {visible.map((link, idx) => (
          <div
            key={link.id}
            draggable
            onDragStart={() => (dragIndex.current = idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current === null || dragIndex.current === idx) return
              const next = [...visible.map((l) => l.id)]
              const [moved] = next.splice(dragIndex.current, 1)
              next.splice(idx, 0, moved)
              onReorder(group.id, next)
              dragIndex.current = null
            }}
            className="link-row group flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b py-3 pr-1 transition-colors hover:bg-accent/50"
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
            {link.url ? (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3"
              >
                <span className="link-underline w-36 shrink-0 truncate text-sm font-medium sm:w-44">
                  {link.name}
                </span>
                <span className="w-full basis-full truncate text-xs text-muted-foreground md:w-auto md:basis-auto">
                  {link.desc}
                </span>
              </a>
            ) : (
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3">
                <span className="flex w-36 shrink-0 items-center gap-1.5 text-sm font-medium sm:w-44">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{link.name}</span>
                </span>
                <span className="w-full basis-full truncate text-xs text-muted-foreground md:w-auto md:basis-auto">
                  {link.note ?? link.desc}
                </span>
              </div>
            )}
            <span className="ml-auto flex shrink-0 items-center gap-1">
              {link.qr && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label={`查看 ${link.name} 二维码`}
                      className="rounded p-1 hover:bg-muted"
                    >
                      <img
                        src={link.qr}
                        alt={`${link.name}二维码`}
                        className="h-10 w-10 rounded border object-cover"
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="end">
                    <img
                      src={link.qr}
                      alt={`${link.name}二维码`}
                      className="h-56 w-56 rounded object-contain"
                    />
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      微信扫一扫，关注公众号
                    </p>
                  </PopoverContent>
                </Popover>
              )}
              {link.url ? (
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              ) : null}
              <button
                aria-label={`隐藏 ${link.name}`}
                onClick={() => onToggleHide(link.id)}
                className="rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
