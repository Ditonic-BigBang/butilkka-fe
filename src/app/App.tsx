import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { MapPage } from '@/pages/map'
import { LoginPage } from '@/pages/login'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { OnboardingPage } from '@/pages/onboarding'
import { OnboardingGuidePage } from '@/pages/onboarding-guide'
import { NotificationsPage } from '@/pages/notifications'
import { useAuthStore } from '@/entities/session'

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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/kakao" element={<AuthCallbackPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/guide" element={<OnboardingGuidePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </SessionGate>
    </BrowserRouter>
  )
}
