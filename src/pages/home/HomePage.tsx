import { Navigate, useNavigate } from 'react-router-dom'
import storeIllustration from '@/shared/assets/illustrations/store.png'
import { MobileLayout } from '@/widgets/mobile-layout'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { CurrentDistrictCard } from '@/entities/district'
import { MetricTrendCard } from '@/shared/ui'
import { useAuthStore, useIsAuthenticated } from '@/entities/session'
import { useHomeDashboard, type HomeDashboard } from './model/useHomeDashboard'
import { HomeHeader } from './ui/HomeHeader'
import { AiBriefingCard } from './ui/AiBriefingCard'

/**
 * 홈 대시보드 (Figma: [1] 홈 558:12360 · API: GET /api/v1/dashboard).
 * 헤더(위치·알림) + 현재 상권 히어로 카드 + AI 한 줄 브리핑 + 지표 그래프(유동인구·점포수·폐업률).
 * 로그인·온보딩 미완료면 온보딩으로 리다이렉트.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthStore((s) => s.user)
  const dashboard = useHomeDashboard()
  // 홈 배경(gray-70)에 노치·상태바 색을 맞춰 이어 보이게 (Android 상태바 색)
  useThemeColor('#f7f7f7')

  // 로그인은 했지만 온보딩을 안 마쳤으면 온보딩부터
  if (isAuthenticated && user && !user.isOnboarded) return <Navigate to="/onboarding" replace />

  let content
  if (dashboard.isPending) {
    content = <DashboardSkeleton />
  } else if (dashboard.isError) {
    content = <DashboardError onRetry={() => dashboard.refetch()} />
  } else {
    content = <DashboardContent data={dashboard.data} />
  }

  return (
    // className: 프레임(노치 영역 포함) 배경을 gray-70 로 → iOS 노치가 홈 배경과 이어짐
    <MobileLayout className="bg-gray-70">
      <div className="min-h-full bg-gray-70">
        <HomeHeader
          location={dashboard.data?.location ?? ''}
          onBell={() => navigate('/notifications')}
        />
        <div className="px-5 pt-3 pb-6">{content}</div>
      </div>
    </MobileLayout>
  )
}

/** 대시보드 본문 — 현재 상권 카드 + 브리핑 + 지표 그래프 */
function DashboardContent({ data }: { data: HomeDashboard }) {
  return (
    <>
      <CurrentDistrictCard
        grade={data.grade}
        lastGrade={data.lastGrade}
        illustration={<img src={storeIllustration} alt="" className="w-[93px]" />}
      />

      <AiBriefingCard message={data.briefing} className="mt-3" />

      {/* 지표 그래프 — 이전 분기 대비 */}
      <section className="mt-14 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-title-s-semibold text-gray-900">지표 그래프</h2>
          <span className="text-body-m-medium text-gray-400">이전 분기 대비</span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <MetricTrendCard {...data.metrics.floating} />
            <MetricTrendCard {...data.metrics.stores} />
          </div>
          <MetricTrendCard layout="horizontal" {...data.metrics.closure} />
        </div>
      </section>
    </>
  )
}

/** 로딩 스켈레톤 — 카드 형태의 회색 플레이스홀더 */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[280px] animate-pulse rounded-16 bg-white" />
      <div className="h-14 animate-pulse rounded-12 bg-white" />
      <div className="mt-11 grid grid-cols-2 gap-3">
        <div className="h-[168px] animate-pulse rounded-12 bg-white" />
        <div className="h-[168px] animate-pulse rounded-12 bg-white" />
      </div>
    </div>
  )
}

/** 에러 — 재시도 */
function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-body-l-medium text-gray-500">대시보드를 불러오지 못했어요</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
      >
        다시 시도
      </button>
    </div>
  )
}
