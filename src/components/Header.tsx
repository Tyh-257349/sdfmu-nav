import { useEffect } from 'react'
import { Moon, Search, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { usePersistent } from '@/lib/store'
import yxz from '@/assets/yxz.png'

export default function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [dark, setDark] = usePersistent<boolean>('sdfmu-dark', false)
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  return <header className="site-header"><div className="header-inner">
    <Link to="/" className="brand" aria-label="医小智学途导航首页"><img src={yxz} alt="医小智" width="46" height="46" /><div><span className="brand-name">医小智学途导航</span><span className="brand-university">Yi Xiao Zhi</span></div></Link>
    <nav className="primary-nav" aria-label="主导航"><NavLink to="/" end>首页</NavLink><NavLink to="/campus">校内服务</NavLink><NavLink to="/outside">校外资源</NavLink><NavLink to="/live">最新动态</NavLink></nav>
    <div className="header-actions"><button className="header-search" onClick={onOpenSearch} aria-label="搜索校内 / 校外功能…"><Search size={17} /><span>搜索</span><kbd>Ctrl K</kbd></button><button className="theme-switch" aria-label="切换深色模式" aria-pressed={dark} onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div>
  </div></header>
}
