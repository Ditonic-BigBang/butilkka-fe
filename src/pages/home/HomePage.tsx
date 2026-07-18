import { preload } from 'react-dom'
import { Navigate, useNavigate } from 'react-router-dom'
import storeIllustration from '@/shared/assets/illustrations/store.png'
import { MobileLayout } from '@/widgets/mobile-layout'
import { THEME_COLORS } from '@/shared/lib/themeColors'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { CurrentDistrictCard } from '@/entities/district'
import { ErrorRetry, MetricTrendCard } from '@/shared/ui'
import { useAuthStore, useIsAuthenticated } from '@/entities/session'
import { useHomeDashboard, type HomeDashboard } from './model/useHomeDashboard'
import { HomeHeader } from './ui/HomeHeader'
import { AiBriefingCard } from './ui/AiBriefingCard'

// 가게 일러스트 프리로드 — 히어로 카드는 대시보드 데이터 도착 후 마운트되므로,
// 그때 fetch 를 시작하면 카드보다 이미지가 늦게 떠서 팝 인이 생긴다.
// 모듈 로드(앱 부팅) 시점에 React 공식 preload 로 미리 받아둔다.
preload(storeIllustration, { as: 'image' })

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
  useThemeColor(THEME_COLORS.surfaceGray)

  // 위치 pill — 마이페이지처럼 온보딩에서 저장한 가게 주소 기준, "서울" 접두만 생략
  // (예: "서울 중구 충무로2가 111" → "중구 충무로2가 111"). 주소 없으면 상권명으로 폴백.
  const storeAddress = user?.store?.address?.replace(/^서울(특별시)?\s+/, '')

  // 로그인은 했지만 온보딩을 안 마쳤으면 온보딩부터
  if (isAuthenticated && user && !user.isOnboarded) return <Navigate to="/onboarding" replace />

  let content
  if (dashboard.isPending) {
    content = <DashboardSkeleton />
  } else if (dashboard.isError) {
    content = (
      <ErrorRetry message="대시보드를 불러오지 못했어요" onRetry={() => dashboard.refetch()} />
    )
  } else {
    content = <DashboardContent data={dashboard.data} />
  }

  return (
    // className: 프레임(노치 영역 포함) 배경을 gray-70 로 → iOS 노치가 홈 배경과 이어짐
    <MobileLayout className="bg-gray-70">
      <div className="min-h-full bg-gray-70">
        <HomeHeader
          location={storeAddress ?? dashboard.data?.location ?? ''}
          onBell={() => navigate('/notifications', { viewTransition: true })}
        />
        <div className="px-5 pt-3 pb-6">{content}</div>
      </div>
    </MobileLayout>
  )
}

/** 대시보드 본문 — 현재 상권 카드 + 브리핑 + 지표 그래프. 진입 시 순차 페이드업 */
function DashboardContent({ data }: { data: HomeDashboard }) {
  return (
    <div className="stagger-fade-up">
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
    </div>
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
