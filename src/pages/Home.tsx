import { ArrowUpRight, BookOpen, GraduationCap, Globe2, Search, Bookmark, LibraryBig, CalendarDays, Mail, Network, WalletCards } from 'lucide-react'
import { Link } from 'react-router'
import CategoryCard from '@/components/CategoryCard'
import LivePreviewCard from '@/components/LivePreviewCard'
import { campusGroups, outsideGroups } from '@/data/links'
import yxzWave from '@/assets/yxz-wave.gif'

const quickIds = ['portal', 'jwc', 'lib', 'mail', 'network', 'pay']
const quickIcons = [GraduationCap, CalendarDays, LibraryBig, Mail, Network, WalletCards]

const RESOURCE_HINTS: Record<string, string> = {
  literature: '知网 / 万方 / PubMed',
  exam: '四六级 / 教资 / 慕课',
  contests: '赛氪网 / 白名单 84 项',
  'open-course': 'B 站 / Coursera / 网易公开课',
}

export default function Home({ onOpenSearch }: { onOpenSearch: (query?: string) => void }) {
  const campusCount = campusGroups.reduce((n, g) => n + g.links.length, 0)
  const outsideCount = outsideGroups.reduce((n, g) => n + g.links.length, 0)
  const campusLinks = campusGroups.flatMap((group) => group.links)
  return <div className="home-page">
    <section className="welcome" aria-labelledby="home-title"><div className="welcome-copy">
      <span className="welcome-university">山东第一医科大学</span>
      <h1 id="home-title">医小智学途导航</h1>
      <p>一站式校内学习生活导航站 · 乐心e站 · 红魂培育坊学生自制</p>
      <div className="hero-search-area"><button className="hero-search" onClick={() => onOpenSearch()}><Search size={21} /><span>搜索校内 / 校外功能…</span><kbd>Ctrl K</kbd><span className="search-submit" aria-hidden="true"><ArrowUpRight size={20} /></span></button><div className="search-suggestions"><span>常用搜索</span>{['成绩', '选课', '知网', '座位预约'].map((query) => <button key={query} onClick={() => onOpenSearch(query)}>{query}</button>)}</div></div>
    </div><div className="university-imprint" aria-label="智启学风 思育青年"><div className="imprint-orbit" aria-hidden="true"><img src={yxzWave} alt="" /></div><p>智启学风 思育青年</p><span>Yi Xiao Zhi</span></div></section>

    <section className="primary-portals" aria-label="导航分类">
      <CategoryCard info={{ id: 'campus', title: '校内服务', subtitle: 'Campus', desc: '学习必备、校园生活、发展就业、资讯通知、公众号专区', count: campusCount }} to="/campus" />
      <CategoryCard info={{ id: 'outside', title: '校外资源', subtitle: 'Resources', desc: '文献检索、考试考证、公开课，加上你自己的收藏', count: outsideCount }} to="/outside" />
      <LivePreviewCard />
    </section>
    <section className="quick-section" aria-labelledby="quick-title"><div className="section-heading"><h2 id="quick-title">常用入口</h2><Link to="/campus">全部校内服务<ArrowUpRight size={15} /></Link></div><div className="quick-links">{quickIds.map((id, index) => {
      const link = campusLinks.find((item) => item.id === id)!
      const Icon = quickIcons[index]
      return <a key={id} href={link.url!} target="_blank" rel="noopener noreferrer" className="quick-link" title={link.desc}><span className="quick-icon"><Icon size={21} strokeWidth={1.65} /></span><span>{link.name}</span><ArrowUpRight className="quick-arrow" size={13} /></a>
    })}</div></section>
    <div className="directory-layout"><section className="campus-directory" aria-labelledby="campus-title"><div className="section-heading"><h2 id="campus-title"><GraduationCap size={21} />校内服务</h2><span>{campusGroups.length} 个分类</span></div><div className="directory-groups">{campusGroups.map((group) => <Link key={group.id} to={`/campus/${group.id}`} className="directory-row"><span className="directory-group-title">{group.title}</span><span className="directory-group-links">{group.links.slice(0, 3).map((link) => link.name).join(' / ')}</span><span className="directory-count">{group.links.length}</span><ArrowUpRight size={16} /></Link>)}</div></section>
      <section className="resource-directory" aria-labelledby="resources-title"><div className="section-heading"><h2 id="resources-title"><Globe2 size={20} />校外资源</h2><Link to="/outside">全部<ArrowUpRight size={15} /></Link></div><div className="resource-groups">{outsideGroups.map((group) => <Link key={group.id} to={`/outside/${group.id}`}><BookOpen size={17} /><span>{group.title}</span><span className="resource-subtitle">{RESOURCE_HINTS[group.id] ?? group.subtitle}</span><ArrowUpRight size={15} /></Link>)}</div><Link className="favorites-entry" to="/outside/favorites"><Bookmark size={18} /><span>我的收藏</span><span>自由增删常用网址</span><ArrowUpRight size={16} /></Link></section>
    </div>
  </div>
}
