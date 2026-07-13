import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { dashboardKeys } from '@/entities/dashboard'
import { dashboardMock } from '@/shared/api/mocks/fixtures'
import { useAuthStore } from '@/entities/session'
import HomePage from './HomePage'

// 스토리는 네트워크 없이 렌더 — 대시보드 목 DTO 를 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(dashboardKeys.detail(), dashboardMock)
  return queryClient
}

// 헤더 위치 pill 은 세션 user.store.address("서울" 접두 생략)를 쓴다 — 온보딩 완료 유저 시드.
function seedAuthedUser() {
  useAuthStore.setState({
    status: 'authenticated',
    user: {
      id: 1,
      name: '홍길동',
      isOnboarded: true,
      store: {
        regionCode: '3110001',
        regionName: '가로수길',
        categoryCode: 'CS100003',
        categoryName: '일식음식점',
        lat: 37.561,
        lng: 126.994,
        address: '서울 중구 충무로2가 111',
      },
    },
  })
}

/** 홈 대시보드 전체 화면. Figma: `[1] 홈 558:12360` · API: `GET /api/v1/dashboard`. */
const meta = {
  title: 'Home/HomePage',
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      seedAuthedUser()
      return (
        <QueryClientProvider client={seededClient()}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      )
    },
  ],
} satisfies Meta<typeof HomePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
