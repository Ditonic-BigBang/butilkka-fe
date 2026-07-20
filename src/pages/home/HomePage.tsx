import { preload } from 'react-dom'
import { Navigate, useNavigate } from 'react-router-dom'
import storeIllustration from '@/shared/assets/illustrations/store.png'
import { MobileLayout } from '@/widgets/mobile-layout'
import { THEME_COLORS } from '@/shared/lib/themeColors'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { CurrentDistrictCard } from '@/entities/district'
import { Bone, ErrorRetry, MetricTrendCard } from '@/shared/ui'
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
    content = (
      <DashboardContent
        data={dashboard.data}
        onViewReport={() => navigate('/report', { viewTransition: true })}
      />
    )
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
function DashboardContent({
  data,
  onViewReport,
}: {
  data: HomeDashboard
  /** 지난 분기 등급 pill·AI 브리핑 카드 탭 → AI 리포트 이동 */
  onViewReport: () => void
}) {
  return (
    <div className="stagger-fade-up">
      <CurrentDistrictCard
        grade={data.grade}
        lastGrade={data.lastGrade}
        onViewLast={onViewReport}
        illustration={<img src={storeIllustration} alt="" className="w-[93px]" />}
      />

      <AiBriefingCard message={data.briefing} onClick={onViewReport} className="mt-3" />

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

/** 로딩 스켈레톤 — 히어로·브리핑·지표 카드의 핵심 요소만 pill 바로 암시 (export 는 스토리 확인용) */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col">
      {/* 현재 상권 히어로 카드 — 제목 2줄 + 등급 + 등급 바 + 지난 분기 pill */}
      <div className="rounded-16 bg-white p-5">
        <div className="flex flex-col gap-2">
          <Bone className="h-4 w-40" />
          <Bone className="h-4 w-28" />
        </div>
        <Bone className="mt-7 h-10 w-24 rounded-10" />
        <Bone className="mt-9 h-2.5 w-full" />
        <div className="mt-7 flex justify-center">
          <Bone className="h-7 w-40 rounded-max" />
        </div>
      </div>

      {/* AI 한 줄 브리핑 카드 */}
      <div className="mt-3 flex flex-col gap-2.5 rounded-12 bg-white px-4 py-3">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-3.5 w-4/5" />
      </div>

      {/* 지표 그래프 — 섹션 타이틀 + 카드 2개 (가로 카드는 폴드 아래라 생략) */}
      <Bone className="mt-14 h-4 w-32" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-12 bg-white p-4">
            <Bone className="h-3.5 w-16" />
            <Bone className="mt-3 h-6 w-20" />
            <Bone className="mt-5 h-14 w-full rounded-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
