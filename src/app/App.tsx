import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { MapPage } from '@/pages/map'
import { LoginPage } from '@/pages/login'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { OnboardingPage } from '@/pages/onboarding'
import { OnboardingGuidePage } from '@/pages/onboarding-guide'
import { NotificationsPage } from '@/pages/notifications'
import { ReportPage } from '@/pages/report'
import { ReportHistoryPage } from '@/pages/report-history'
import { ReportDetailPage } from '@/pages/report-detail'
import { ReportCasesPage } from '@/pages/report-cases'
import { MyPage } from '@/pages/my'
import { MyStorePage } from '@/pages/my-store'
import { MyStoreEditPage } from '@/pages/my-store-edit'
import { MyCategoryPage } from '@/pages/my-category'
import { SubscriptionPage } from '@/pages/subscription'
import { SubscriptionCompletePage } from '@/pages/subscription-complete'
import { useAuthStore } from '@/entities/session'
import { useAppHeight } from '@/shared/lib/useAppHeight'

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
  // iOS PWA 뷰포트 높이 안정화 (100dvh 첫 렌더 어긋남 → 하단 탭 위로 뜨는 문제 방지)
  useAppHeight()

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
        </Routes>
      </SessionGate>
    </BrowserRouter>
  )
}
