import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/api/mocks/server'
import { useAuthStore } from '@/entities/session'
import App from './App'

const API = import.meta.env.VITE_API_BASE_URL ?? ''

// main.tsx 의 QueryClientProvider 를 테스트에서 재현 — 테스트마다 새 클라이언트(캐시 격리, 재시도 off)
function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    // 테스트 간 격리 — jsdom URL 과 auth 스토어(zustand 모듈 상태)가 남지 않게 초기화
    window.history.replaceState(null, '', '/')
    useAuthStore.setState({ user: null, status: 'idle' })
  })

  it('비로그인 사용자는 로그인 페이지로 이동한다', async () => {
    // 실서버 특성 재현: 미인증 /me = 403, refresh = 401 (쿠키 없음)
    server.use(
      http.get(`${API}/api/v1/users/me`, () => new HttpResponse(null, { status: 403 })),
      http.post(`${API}/api/v1/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    )
    renderApp()
    // lazy 라우트 청크 로드를 기다림 (CI 부하 대비 타임아웃 상향)
    expect(
      await screen.findByRole('button', { name: /카카오 로그인/ }, { timeout: 10000 }),
    ).toBeInTheDocument()
  })

  it('미온보딩 사용자는 온보딩(약관 동의)으로 이동한다', async () => {
    // 기본 mock: isOnboarded=false → 홈 게이트가 /onboarding 으로 보낸다
    renderApp()
    // 온보딩 페이지가 lazy 라우트라 청크 로드까지 대기 (CI 부하에서 1s 기본 타임아웃 초과 방지)
    expect(
      await screen.findByText(/서비스 이용약관에/, undefined, { timeout: 10000 }),
    ).toBeInTheDocument()
  })

  it('미구독 사용자가 지난 리포트 URL 로 직접 들어오면 구독 화면으로 보낸다', async () => {
    // 리포트 본문·지도는 잠금 오버레이로 덮지만, 화면 전체가 유료인 라우트는 라우터가 막는다
    window.history.replaceState(null, '', '/report/history')
    server.use(
      http.get(`${API}/api/v1/users/me`, () =>
        HttpResponse.json({
          code: 200,
          status: 'OK',
          message: '사용자 정보 조회 성공',
          data: { id: 1, name: '테스트유저', isOnboarded: true, isReportPro: false, store: null },
        }),
      ),
    )
    renderApp()
    expect(
      await screen.findByText('구독 플랜 확인하기', undefined, { timeout: 10000 }),
    ).toBeInTheDocument()
  })

  it('온보딩을 마친 사용자는 홈을 렌더링한다', async () => {
    server.use(
      http.get(`${API}/api/v1/users/me`, () =>
        HttpResponse.json({
          code: 200,
          status: 'OK',
          message: '사용자 정보 조회 성공',
          data: { id: 1, name: '테스트유저', isOnboarded: true, store: null },
        }),
      ),
    )
    renderApp()
    // 대시보드(GET /api/v1/dashboard) 목이 로드되면 헤더에 내 상권 위치가 뜬다 = 홈 렌더 성공
    // (위치 폴백 = dashboard.store.address 에서 "서울" 접두를 뗀 값)
    // 홈도 lazy 라우트라 청크 로드까지 대기 (CI 부하 대비 타임아웃 상향)
    expect(
      await screen.findByText('강남구 신사동', undefined, { timeout: 10000 }),
    ).toBeInTheDocument()
  })
})
