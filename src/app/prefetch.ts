import type { QueryClient } from '@tanstack/react-query'

// 라우트 청크 import 썽크 — App 의 lazy() 와 idle 프리페치가 같은 함수를 공유해
// 어느 쪽이 먼저 호출돼도 청크는 한 번만 다운로드된다.
export const routeImports = {
  home: () => import('@/pages/home/HomePage'),
  map: () => import('@/pages/map/MapPage'),
  favoriteRegions: () => import('@/pages/favorite-regions/FavoriteRegionsPage'),
  login: () => import('@/pages/login/LoginPage'),
  authCallback: () => import('@/pages/auth-callback/AuthCallbackPage'),
  onboarding: () => import('@/pages/onboarding/OnboardingPage'),
  onboardingGuide: () => import('@/pages/onboarding-guide/OnboardingGuidePage'),
  notifications: () => import('@/pages/notifications/NotificationsPage'),
  report: () => import('@/pages/report/ReportPage'),
  reportHistory: () => import('@/pages/report-history/ReportHistoryPage'),
  reportDetail: () => import('@/pages/report-detail/ReportDetailPage'),
  reportCases: () => import('@/pages/report-cases/ReportCasesPage'),
  my: () => import('@/pages/my/MyPage'),
  myStore: () => import('@/pages/my-store/MyStorePage'),
  myStoreEdit: () => import('@/pages/my-store-edit/MyStoreEditPage'),
  myCategory: () => import('@/pages/my-category/MyCategoryPage'),
  subscription: () => import('@/pages/subscription/SubscriptionPage'),
  subscriptionComplete: () => import('@/pages/subscription-complete/SubscriptionCompletePage'),
}

// 하단 탭(지도·리포트·마이)이 첫 전환 대상이라 앞에 — 나머지는 뒤이어 받는다.
// home 은 부팅 즉시 킥오프(App.tsx)라 여기 없음.
const PREFETCH_ORDER: Array<keyof typeof routeImports> = [
  'map',
  'report',
  'my',
  'notifications',
  'reportHistory',
  'reportDetail',
  'reportCases',
  'favoriteRegions',
  'myStore',
  'myStoreEdit',
  'myCategory',
  'subscription',
  'subscriptionComplete',
  'onboarding',
  'onboardingGuide',
  'login',
  'authCallback',
]

let scheduled = false

/**
 * 첫 페인트 이후 idle 에 나머지 화면 리소스를 전부 미리 받는다 — 탭 첫 전환 스피너,
 * 지도 첫 진입(SDK 핸드셰이크·geojson)·구 선택 첫 그래프(recharts) 지연 제거.
 * 전부 정적 리소스라 인증 여부와 무관하게 실행한다.
 */
export function schedulePrefetch(queryClient: QueryClient) {
  if (scheduled) return
  scheduled = true

  // SDK 로더·guGeometry 도 정적 import 하지 않고 idle 에 동적 로드 — 정적으로 걸면
  // entities/district 배럴이 엔트리 번들에 딸려 들어가 첫 로드 예산(120KB)을 깨뜨린다.
  const run = () => {
    for (const key of PREFETCH_ORDER) void routeImports[key]().catch(() => {})
    void import('@/shared/lib/useKakaoMapsSDK')
      .then(({ loadKakaoMapsSDK }) => loadKakaoMapsSDK())
      .catch(() => {})
    void import('@/entities/district')
      .then(({ guGeometryQueryOptions }) => queryClient.prefetchQuery(guGeometryQueryOptions))
      .catch(() => {})
    void import('@/shared/ui/TrendGraph/TrendGraph').catch(() => {})
  }

  // 첫 페인트·초기 fetch 와 경합하지 않게 idle 에 — Safari(iOS)는 미지원이라 setTimeout 폴백.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 3000 })
  } else {
    setTimeout(run, 1500)
  }
}
