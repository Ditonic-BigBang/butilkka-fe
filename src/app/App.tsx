import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { dashboardKeys, fetchDashboard } from '@/entities/dashboard'
import { useAuthStore } from '@/entities/session'
import { PwaInstallGate } from '@/widgets/pwa-install'
import { queryClient } from '@/shared/api/queryClient'
import { useAppHeight } from '@/shared/lib/useAppHeight'
import { ErrorRetry } from '@/shared/ui/ErrorRetry/ErrorRetry'
import { Logo } from '@/shared/ui/Logo/Logo'
import { Spinner } from '@/shared/ui/Spinner/Spinner'
import { routeImports, schedulePrefetch } from './prefetch'

// 홈 청크를 부팅 즉시 킥오프 — SessionGate 의 세션 확인 fetch 와 병렬 다운로드
// (세션 확인 → 홈 청크 → 홈 데이터 3단 직렬이던 콜드 스타트의 1단계 제거).
void routeImports.home()

const HomePage = lazy(routeImports.home)
const MapPage = lazy(routeImports.map)
const FavoriteRegionsPage = lazy(routeImports.favoriteRegions)
const LoginPage = lazy(routeImports.login)
const AuthCallbackPage = lazy(routeImports.authCallback)
const OnboardingPage = lazy(routeImports.onboarding)
const OnboardingGuidePage = lazy(routeImports.onboardingGuide)
const NotificationsPage = lazy(routeImports.notifications)
const ReportPage = lazy(routeImports.report)
const ReportHistoryPage = lazy(routeImports.reportHistory)
const ReportDetailPage = lazy(routeImports.reportDetail)
const ReportCasesPage = lazy(routeImports.reportCases)
const MyPage = lazy(routeImports.my)
const MyStorePage = lazy(routeImports.myStore)
const MyStoreEditPage = lazy(routeImports.myStoreEdit)
const MyCategoryPage = lazy(routeImports.myCategory)
const SubscriptionPage = lazy(routeImports.subscription)
const SubscriptionCompletePage = lazy(routeImports.subscriptionComplete)

const SPINNER_DELAY_MS = 200

function FullScreenSpinner({ label = '화면 불러오는 중' }: { label?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), SPINNER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-[var(--app-height,100dvh)] items-center justify-center bg-white">
      {visible && <Spinner aria-label={label} />}
    </div>
  )
}

/** 앱 부팅(세션 확인) 브랜드 스플래시 — PWA 설치 스플래시(오렌지 배경+화이트 로고)와 동일 톤 */
function BrandSplash() {
  return (
    <div className="flex min-h-[var(--app-height,100dvh)] items-center justify-center bg-key">
      <Logo variant="white" className="h-12" />
    </div>
  )
}

type LazyRouteErrorBoundaryState = { failed: boolean }

class LazyRouteErrorBoundary extends Component<
  { children: ReactNode },
  LazyRouteErrorBoundaryState
> {
  state: LazyRouteErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): LazyRouteErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[route] 페이지 청크 로드 실패', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex min-h-[var(--app-height,100dvh)] items-center justify-center bg-white px-5">
          <ErrorRetry
            message="화면을 불러오지 못했어요."
            onRetry={() => window.location.reload()}
          />
        </div>
      )
    }
    return this.props.children
  }
}

function AuthBootstrap() {
  const location = useLocation()
  const status = useAuthStore((s) => s.status)
  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    if (location.pathname === '/auth/kakao') return
    if (status !== 'idle') return

    void restoreSession()
      .then(() => {
        // 세션 확정 즉시 홈 데이터를 미리 요청 — HomePage 마운트를 기다리는 직렬 단계 제거.
        if (useAuthStore.getState().status !== 'authenticated') return
        void queryClient.prefetchQuery({
          queryKey: dashboardKeys.detail(),
          queryFn: fetchDashboard,
        })
      })
      .catch(() => {
        // 세션 확인 실패는 비로그인 상태로 처리한다. 상세 에러는 API 계층에서 필요 시 확장한다.
      })
  }, [location.pathname, status, restoreSession])

  return null
}

// 비로그인 접근 차단 — SessionGate 통과 후 렌더되므로 status 는 authenticated/anonymous 로 확정.
// MSW 데모는 목 /me 가 항상 로그인을 줘서 필요 없었지만, 실서버는 미인증(403)이 실제로 발생한다.
function RequireAuth() {
  const status = useAuthStore((s) => s.status)
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

// 세션 확인(idle/checking) 동안 스플래시 표시 → 로그인 UI 깜빡임·조기 리다이렉트 방지.
// 콜백 페이지(/auth/kakao)는 자체 navigate 처리가 돌아야 하므로 게이트에서 제외.
function SessionGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const status = useAuthStore((s) => s.status)
  const resolving = status === 'idle' || status === 'checking'

  if (resolving && location.pathname !== '/auth/kakao') {
    return <BrandSplash />
  }
  return <>{children}</>
}

function AppRoutes() {
  const location = useLocation()

  return (
    <LazyRouteErrorBoundary key={location.pathname}>
      <Suspense fallback={<FullScreenSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/kakao" element={<AuthCallbackPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/guide" element={<OnboardingGuidePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/map/favorites" element={<FavoriteRegionsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/report/history" element={<ReportHistoryPage />} />
            <Route path="/report/:reportId" element={<ReportDetailPage />} />
            <Route path="/report/:reportId/cases" element={<ReportCasesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my" element={<MyPage />} />
            <Route path="/my/store" element={<MyStorePage />} />
            <Route path="/my/store/new" element={<MyStoreEditPage />} />
            <Route path="/my/store/:storeId/edit" element={<MyStoreEditPage />} />
            <Route path="/my/category" element={<MyCategoryPage />} />
            <Route path="/my/subscription" element={<SubscriptionPage />} />
            <Route path="/my/subscription/complete" element={<SubscriptionCompletePage />} />
          </Route>
        </Routes>
      </Suspense>
    </LazyRouteErrorBoundary>
  )
}

export default function App() {
  // iOS PWA 뷰포트 높이 안정화 (100dvh 첫 렌더 어긋남 → 하단 탭 위로 뜨는 문제 방지)
  useAppHeight()

  // 첫 페인트 이후 idle 에 나머지 라우트 청크·카카오 SDK·geojson·recharts 선로드
  useEffect(() => {
    schedulePrefetch(queryClient)
  }, [])

  return (
    <BrowserRouter>
      <AuthBootstrap />
      <SessionGate>
        <AppRoutes />
      </SessionGate>
      {/* 홈 화면에 추가 유도 — 설치 가능 상황에서만 하단 시트 노출(그 외엔 렌더 안 함) */}
      <PwaInstallGate />
    </BrowserRouter>
  )
}
