import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReportRecommendation } from '@/shared/api/types'
import { makeReportMock, reportHistoryMock } from '@/shared/api/mocks/fixtures'
import ReportPage from './ReportPage'
import { reportKeys } from './model/useLatestReport'

// 스토리는 네트워크 없이 렌더 — 리포트 목 DTO 를 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient(recommendation: ReportRecommendation) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(reportKeys.latest(), makeReportMock(recommendation))
  queryClient.setQueryData(reportKeys.history(), reportHistoryMock)
  return queryClient
}

function decorator(recommendation: ReportRecommendation) {
  return (Story: React.ComponentType) => (
    <QueryClientProvider client={seededClient(recommendation)}>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

/**
 * AI 리포트 전체 화면. Figma: `[3] AI 리포트/[3-1] 기본 267:4266·4528` ·
 * API: `GET /api/v1/reports/latest`. AI 추천(버티기/이동)에 따라
 * 추천 타이틀과 대체 상권 섹션(HOT상권 / 추천 대체 상권)이 갈린다.
 */
const meta = {
  title: 'Report/ReportPage',
  component: ReportPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReportPage>

export default meta
type Story = StoryObj<typeof meta>

/** 이동 추천 — "새로운 상권을 함께 살펴보세요" + 추천 대체 상권 */
export const Move: Story = {
  name: '이동 추천',
  decorators: [decorator('이동')],
}

/** 버티기 추천 — "현재 상태 유지를 추천드려요" + 분기 HOT상권 🔥 */
export const Stay: Story = {
  name: '버티기 추천',
  decorators: [decorator('버티기')],
}
