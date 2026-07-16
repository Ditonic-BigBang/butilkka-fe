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
import { useAuthStore } from '@/entities/session'
import { PwaInstallGate } from '@/widgets/pwa-install'
import { useAppHeight } from '@/shared/lib/useAppHeight'
import { ErrorRetry } from '@/shared/ui/ErrorRetry/ErrorRetry'
import { Spinner } from '@/shared/ui/Spinner/Spinner'

const HomePage = lazy(() => import('@/pages/home/HomePage'))
const MapPage = lazy(() => import('@/pages/map/MapPage'))
const FavoriteRegionsPage = lazy(() => import('@/pages/favorite-regions/FavoriteRegionsPage'))
const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const AuthCallbackPage = lazy(() => import('@/pages/auth-callback/AuthCallbackPage'))
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'))
const OnboardingGuidePage = lazy(() => import('@/pages/onboarding-guide/OnboardingGuidePage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const ReportPage = lazy(() => import('@/pages/report/ReportPage'))
const ReportHistoryPage = lazy(() => import('@/pages/report-history/ReportHistoryPage'))
const ReportDetailPage = lazy(() => import('@/pages/report-detail/ReportDetailPage'))
const ReportCasesPage = lazy(() => import('@/pages/report-cases/ReportCasesPage'))
const MyPage = lazy(() => import('@/pages/my/MyPage'))
const MyStorePage = lazy(() => import('@/pages/my-store/MyStorePage'))
const MyStoreEditPage = lazy(() => import('@/pages/my-store-edit/MyStoreEditPage'))
const MyCategoryPage = lazy(() => import('@/pages/my-category/MyCategoryPage'))
const SubscriptionPage = lazy(() => import('@/pages/subscription/SubscriptionPage'))
const SubscriptionCompletePage = lazy(
  () => import('@/pages/subscription-complete/SubscriptionCompletePage'),
)

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

    void restoreSession().catch(() => {
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
    return <FullScreenSpinner label="세션 확인 중" />
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
