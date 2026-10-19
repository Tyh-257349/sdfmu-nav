import { BackButton } from '@/components/CategoryCard'
import LiveBoard from '@/components/LiveBoard'

export default function LivePage() {
  return (
    <div>
      <BackButton to="/" label="返回首页" />
      <h1 className="mb-1 text-2xl font-semibold tracking-[0.1px]">
        最新动态
      </h1>
      <p className="mb-8 text-xs tracking-[0.1px] text-muted-foreground">
        教务、学工、学院的公告和学校的通知、讲座、招聘，实时抓取自各官方网站。
      </p>
      <LiveBoard />
    </div>
  )
}
