import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router'
import Header from '@/components/Header'
import SearchDialog from '@/components/SearchDialog'
import Home from './pages/Home'
import LivePage from './pages/LivePage'
import CategoryIndex from './pages/CategoryIndex'
import GroupPage from './pages/GroupPage'

export default function App() {
  const [search, setSearch] = useState<{ query: string } | null>(null)
  const { pathname } = useLocation()
  const openSearch = useCallback((query = '') => setSearch({ query }), [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearch((current) => current ? null : { query: '' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">跳转到主要内容</a>
      <Header onOpenSearch={() => openSearch()} />
      <main id="main-content" className={`site-main ${pathname === '/' ? 'is-home' : 'inner-page'}`}>
        <Routes>
          <Route path="/" element={<Home onOpenSearch={openSearch} />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/campus" element={<CategoryIndex scope="campus" />} />
          <Route path="/campus/:groupId" element={<GroupPage key="campus" scope="campus" />} />
          <Route path="/outside" element={<CategoryIndex scope="outside" />} />
          <Route path="/outside/:groupId" element={<GroupPage key="outside" scope="outside" />} />
        </Routes>
      </main>
      <footer className="site-footer"><div><Link to="/">山一大导航</Link><span>山东第一医科大学学生自制导航</span></div><p>跬步千里 · 止于至善</p></footer>
      {search && <SearchDialog open onOpenChange={(open) => { if (!open) setSearch(null) }} initialQuery={search.query} />}
    </div>
  )
}
