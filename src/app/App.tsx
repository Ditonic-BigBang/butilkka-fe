import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { MobileLayout } from '@/widgets/mobile-layout'
import { MapPage } from '@/pages/map'
import { LoginPage } from '@/pages/login'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { OnboardingPage } from '@/pages/onboarding'
import { OnboardingGuidePage } from '@/pages/onboarding-guide'
import { useAuthStore, useIsAuthenticated } from '@/entities/session'

// 셸(바텀탭)을 쓰는 일반 화면. 지도(/map)는 풀스크린이라 셸 밖에서 렌더.
function Home() {
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // 로그인은 했지만 온보딩을 안 마쳤으면 온보딩부터
  if (isAuthenticated && user && !user.isOnboarded) return <Navigate to="/onboarding" replace />

  return (
    <MobileLayout>
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-gray-900">
        <h1 className="text-2xl font-bold tracking-tight">버틸까?</h1>
        <p className="text-sm text-gray-500">서울 자치구 지도</p>
        <Link
          to="/map"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          지도 보기
        </Link>
        {isAuthenticated ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-green-600">로그인됨 ✅</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg border border-indigo-200 px-4 py-2 font-medium text-indigo-600 transition hover:bg-indigo-50"
          >
            로그인
          </Link>
        )}
      </div>
    </MobileLayout>
  )
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

// 세션 확인(idle/checking) 동안 스플래시 표시 → 로그인 UI 깜빡임·조기 리다이렉트 방지.
// 콜백 페이지(/auth/kakao)는 자체 navigate 처리가 돌아야 하므로 게이트에서 제외.
function SessionGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const status = useAuthStore((s) => s.status)
  const resolving = status === 'idle' || status === 'checking'

  if (resolving && location.pathname !== '/auth/kakao') {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-gray-400">
        세션 확인 중…
      </div>
    )
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <SessionGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/kakao" element={<AuthCallbackPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/guide" element={<OnboardingGuidePage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </SessionGate>
    </BrowserRouter>
  )
}
