import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { dashboardMock } from '@/shared/api/mocks/fixtures'
import HomePage from './HomePage'
import { dashboardKeys } from './model/useHomeDashboard'

// 스토리는 네트워크 없이 렌더 — 대시보드 목 DTO 를 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(dashboardKeys.detail(), dashboardMock)
  return queryClient
}

/** 홈 대시보드 전체 화면. Figma: `[1] 홈 558:12360` · API: `GET /api/v1/dashboard`. */
const meta = {
  title: 'Home/HomePage',
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={seededClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof HomePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
