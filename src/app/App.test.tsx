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

  it('미온보딩 사용자는 온보딩(약관 동의)으로 이동한다', async () => {
    // 기본 mock: isOnboarded=false → 홈 게이트가 /onboarding 으로 보낸다
    renderApp()
    expect(await screen.findByText(/서비스 이용약관에/)).toBeInTheDocument()
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
    expect(await screen.findByText('마포구 가로수길')).toBeInTheDocument()
  })
})
