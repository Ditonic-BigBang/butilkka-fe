import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reportKeys } from '@/entities/report'
import { makeReportDetailMock, reportHistoryMock } from '@/shared/api/mocks/fixtures'
import ReportDetailPage from './ReportDetailPage'

// 스토리는 네트워크 없이 렌더 — 히스토리 항목 기반 상세 목을 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient(reportId: number) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  const item = reportHistoryMock.reports.find((r) => r.reportId === reportId)
  if (item) queryClient.setQueryData(reportKeys.detail(reportId), makeReportDetailMock(item))
  return queryClient
}

function decorator(reportId: number) {
  return (Story: React.ComponentType) => (
    <QueryClientProvider client={seededClient(reportId)}>
      <MemoryRouter initialEntries={[`/report/${reportId}`]}>
        <Routes>
          <Route path="/report/:reportId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

/**
 * 지난 리포트 상세보기 전체 화면. Figma: `[3-4] 지난 리포트 상세보기 267:4395` ·
 * API: `GET /api/v1/reports/{reportId}`. 본문은 최신 리포트와 동일한 ReportOverview 위젯 —
 * 등급 좋은 분기(A·B)는 버티기, 나쁜 분기(C~E)는 이동 추천으로 갈린다.
 */
const meta = {
  title: 'Report/ReportDetailPage',
  component: ReportDetailPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReportDetailPage>

export default meta
type Story = StoryObj<typeof meta>

/** 2026년 1분기 (B등급) — 버티기 추천 상태 */
export const StayQuarter: Story = {
  name: 'B등급 분기 (버티기)',
  decorators: [decorator(12)],
}

/** 2026년 2분기 (C등급) — 이동 추천 상태 */
export const MoveQuarter: Story = {
  name: 'C등급 분기 (이동)',
  decorators: [decorator(17)],
}
