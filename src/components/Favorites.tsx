import { useState } from 'react'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePersistent } from '@/lib/store'

export interface Favorite {
  id: string
  name: string
  url: string
  desc: string
}

let seq = 0
const genId = () => `fav-${Date.now()}-${seq++}`

// 自定义收藏夹：用户自己添加的链接
export default function Favorites() {
  const [favs, setFavs] = usePersistent<Favorite[]>('sdfmu-favorites', [])
  const [editing, setEditing] = useState<Favorite | null>(null)
  const [open, setOpen] = useState(false)

  const save = (f: Favorite) => {
    setFavs((prev) =>
      prev.some((x) => x.id === f.id)
        ? prev.map((x) => (x.id === f.id ? f : x))
        : [...prev, f],
    )
    setOpen(false)
    setEditing(null)
  }

  const remove = (id: string) => setFavs((prev) => prev.filter((x) => x.id !== id))

  return (
    <section className="favorites-section mb-12">
      <div className="mb-1 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold tracking-[0.1px]">我的收藏</h2>
        <span className="text-[10px] tracking-[1px] text-muted-foreground uppercase">
          Favorites
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs"
              onClick={() => setEditing(null)}
            >
              <Plus className="h-3.5 w-3.5" />
              添加链接
            </Button>
          </DialogTrigger>
          <FavoriteDialog
            key={editing?.id ?? `new-${open}`}
            initial={editing ?? { id: genId(), name: '', url: 'https://', desc: '' }}
            onSave={save}
          />
        </Dialog>
      </div>

      <div className="border-t">
        {favs.length === 0 && (
          <p className="border-b py-6 text-center text-xs text-muted-foreground">
            还没有收藏——点右上角「添加链接」把常用网址放进来
          </p>
        )}
        {favs.map((f) => (
          <div
            key={f.id}
            className="group flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b py-3 pr-1 transition-colors hover:bg-accent/50"
          >
            <Star className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" />
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3"
            >
              <span className="link-underline w-36 shrink-0 truncate text-sm font-medium sm:w-44">
                {f.name}
              </span>
              <span className="w-full basis-full truncate text-xs text-muted-foreground md:w-auto md:basis-auto">
                {f.desc || f.url}
              </span>
            </a>
            <span className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                aria-label={`编辑 ${f.name}`}
                onClick={() => {
                  setEditing(f)
                  setOpen(true)
                }}
                className="rounded p-1 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label={`删除 ${f.name}`}
                onClick={() => remove(f.id)}
                className="rounded p-1 text-muted-foreground/60 hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FavoriteDialog({
  initial,
  onSave,
}: {
  initial: Favorite
  onSave: (f: Favorite) => void
}) {
  const [f, setF] = useState(initial)

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{initial.name ? '编辑收藏' : '添加收藏'}</DialogTitle>
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (f.name.trim() && f.url.trim()) onSave(f)
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="fav-name">名称</Label>
          <Input
            id="fav-name"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="例如：医学统计学课件"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fav-url">网址</Label>
          <Input
            id="fav-url"
            type="url"
            value={f.url}
            onChange={(e) => setF({ ...f, url: e.target.value })}
            placeholder="https://…"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fav-desc">备注（可选）</Label>
          <Input
            id="fav-desc"
            value={f.desc}
            onChange={(e) => setF({ ...f, desc: e.target.value })}
            placeholder="一句话说明这是干什么的"
          />
        </div>
        <Button type="submit" className="w-full">
          保存
        </Button>
      </form>
    </DialogContent>
  )
}
