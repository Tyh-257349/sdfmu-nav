import { ArrowUpRight, ArrowUpLeft, GraduationCap, Globe2, Radio, BookOpen, Bookmark, BriefcaseBusiness, MessageCircle, Newspaper, LibraryBig, Trophy, MonitorPlay } from 'lucide-react'
import { Link } from 'react-router'

export interface CategoryInfo { id: string; title: string; subtitle: string; desc: string; count: number }
const icons: Record<string, typeof GraduationCap> = { campus: GraduationCap, outside: Globe2, live: Radio, study: BookOpen, life: GraduationCap, career: BriefcaseBusiness, news: Newspaper, wechat: MessageCircle, literature: LibraryBig, exam: BookOpen, contests: Trophy, 'open-course': MonitorPlay, favorites: Bookmark }

export default function CategoryCard({ info, to }: { info: CategoryInfo; to: string }) {
  const Icon = icons[info.id] ?? BookOpen
  const inner = <><div className="portal-top"><Icon size={25} strokeWidth={1.5} /><span>{info.subtitle}</span></div><h2>{info.title}</h2><p>{info.desc}</p><div className="portal-bottom"><span>{info.count > 0 ? `${info.count} 个入口` : info.id === 'live' ? '实时抓取自各官方网站' : ''}</span><span className="portal-arrow"><ArrowUpRight size={20} strokeWidth={1.5} /></span></div></>
  const className = `portal-card portal-${info.id}`
  return to.startsWith('http') || to.startsWith('#') ? <a href={to} className={className}>{inner}</a> : <Link to={to} className={className}>{inner}</Link>
}
export function BackButton({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="back-link"><ArrowUpLeft size={15} /><span>{label}</span></Link>
}
