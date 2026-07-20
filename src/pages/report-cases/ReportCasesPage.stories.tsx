import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reportKeys } from '@/entities/report'
import { reportCasesMock } from '@/shared/api/mocks/fixtures'
import { GNB } from '@/widgets/mobile-layout'
import { SortTrigger } from '@/shared/ui'
import ReportCasesPage, { CasesSkeleton } from './ReportCasesPage'

const REPORT_ID = 17

// 스토리는 네트워크 없이 렌더 — 유사 사례 목을 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(reportKeys.cases(REPORT_ID), reportCasesMock)
  return queryClient
}

/**
 * 유사 사례 전체보기 전체 화면. Figma: `[3-5] 유사사례 전체보기 267:5486` ·
 * API: `GET /api/v1/reports/{reportId}/cases`. 정렬(기간순/추천순)은 클라이언트 처리,
 * 카드를 펼치면 AI 설명(✦)과 관련 태그가 보인다.
 */
const meta = {
  title: 'Report/ReportCasesPage',
  component: ReportCasesPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={seededClient()}>
        <MemoryRouter initialEntries={[`/report/${REPORT_ID}/cases`]}>
          <Routes>
            <Route path="/report/:reportId/cases" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ReportCasesPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 로딩 스켈레톤 — 유사 사례 목록 응답 대기 (shimmer). GNB·정렬은 로딩 중에도 실 UI 그대로 */
export const Skeleton: Story = {
  name: '로딩 스켈레톤',
  render: () => (
    <div className="flex min-h-screen flex-col bg-white">
      <GNB title="유사 사례" showSettings={false} />
      <div className="px-5 py-3">
        <SortTrigger label="최신순" direction="desc" />
      </div>
      <CasesSkeleton />
    </div>
  ),
}
