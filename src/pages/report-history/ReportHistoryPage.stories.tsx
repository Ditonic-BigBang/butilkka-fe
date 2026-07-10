import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reportKeys } from '@/entities/report'
import { reportHistoryMock } from '@/shared/api/mocks/fixtures'
import ReportHistoryPage from './ReportHistoryPage'

// 스토리는 네트워크 없이 렌더 — 히스토리 목 DTO 를 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(reportKeys.history(), reportHistoryMock)
  return queryClient
}

/**
 * 리포트 상세보기(히스토리) 전체 화면. Figma: `[3-3] 리포트 상세보기 267:5542` ·
 * API: `GET /api/v1/reportsHistory`. 정렬(최신순/오래된순)은 클라이언트 처리,
 * 안 읽음 리포트는 soft-blue 배경으로 강조된다.
 */
const meta = {
  title: 'Report/ReportHistoryPage',
  component: ReportHistoryPage,
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
} satisfies Meta<typeof ReportHistoryPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
