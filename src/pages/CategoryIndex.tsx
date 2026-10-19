import CategoryCard, {
  BackButton,
  type CategoryInfo,
} from '@/components/CategoryCard'
import { campusGroups, outsideGroups } from '@/data/links'

const CAMPUS_META: Record<string, { desc: string }> = {
  study: { desc: '信息门户、教务系统、图书馆、邮箱——每天学习的第一站' },
  life: { desc: '网络、后勤、缴费、学工、团委——校园生活事务办理' },
  career: { desc: '就业招聘、考研升学、招生信息、科研申报' },
  news: { desc: '学校官网、通知公告、学术动态、校历——官方资讯' },
  wechat: { desc: '学校官方、图书馆、学院、工作室的微信公众号' },
}

const OUTSIDE_META: Record<string, { desc: string }> = {
  favorites: { desc: '你自己添加的常用网址，可自由增删改' },
  literature: { desc: '知网、万方、维普、PubMed 等文献数据库' },
  exam: { desc: '四六级、计算机等级考试、MOOC 网课平台' },
  'open-course': { desc: 'B 站、Coursera、网易公开课等免费课程' },
  contests: { desc: '赛氪网报名平台与教育部白名单竞赛名单（84 项）' },
}

export default function CategoryIndex({
  scope,
}: {
  scope: 'campus' | 'outside'
}) {
  const isCampus = scope === 'campus'
  const groups = isCampus ? campusGroups : outsideGroups
  const infos: CategoryInfo[] = isCampus
    ? groups.map((g) => ({
        id: g.id,
        title: g.title,
        subtitle: g.subtitle,
        desc: CAMPUS_META[g.id]?.desc ?? '',
        count: g.links.length,
      }))
    : [
        {
          id: 'favorites',
          title: '我的收藏',
          subtitle: 'Favorites',
          desc: OUTSIDE_META.favorites.desc,
          count: 0,
        },
        ...groups.map((g) => ({
          id: g.id,
          title: g.title,
          subtitle: g.subtitle,
          desc: OUTSIDE_META[g.id]?.desc ?? '',
          count: g.links.length,
        })),
      ]

  return (
    <div className={`category-page scope-${scope}`}>
      <BackButton to="/" label="返回首页" />
      <h1 className="mb-1 text-2xl font-semibold tracking-[0.1px]">
        {isCampus ? '校内服务' : '校外资源'}
      </h1>
      <p className="mb-8 text-xs tracking-[0.1px] text-muted-foreground">
        {isCampus
          ? '学校官网提供的功能入口，选择一个分类进入'
          : '学校官网没有的校外资源，选择一个分类进入'}
      </p>
      <div className="category-grid">
        {infos.map((info) => (
          <CategoryCard
            key={info.id}
            info={info}
            to={`/${scope}/${info.id}`}
          />
        ))}
      </div>
    </div>
  )
}
