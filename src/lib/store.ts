import { useCallback, useState } from 'react'

// 本地持久化状态：所有个性化数据都存在浏览器 localStorage
export function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // 存储失败时静默降级为内存态
        }
        return next
      })
    },
    [key],
  )

  return [value, set] as const
}
