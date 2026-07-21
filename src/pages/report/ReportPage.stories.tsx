import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReportRecommendation } from '@/entities/report'
import { makeReportMock, reportHistoryMock } from '@/shared/api/mocks/fixtures'
import { reportKeys } from '@/entities/report'
import { useAuthStore } from '@/entities/session'
import ReportPage from './ReportPage'

// 스토리는 네트워크 없이 렌더 — 리포트 목 DTO 를 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient(recommendation: ReportRecommendation) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(reportKeys.latest(), makeReportMock(recommendation))
  queryClient.setQueryData(reportKeys.history(), reportHistoryMock)
  return queryClient
}

// 잠금 여부는 세션 user.isReportPro 에서 읽는다 — 스토리별로 시드.
function seedAuthedUser(isReportPro: boolean) {
  useAuthStore.setState({
    status: 'authenticated',
    user: { id: 1, name: '홍길동', isOnboarded: true, isReportPro },
  })
}

function decorator(recommendation: ReportRecommendation, isReportPro = true) {
  return (Story: React.ComponentType) => {
    seedAuthedUser(isReportPro)
    return (
      <QueryClientProvider client={seededClient(recommendation)}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

/**
 * AI 리포트 전체 화면. Figma: `[3] AI 리포트/[3-1] 기본 267:4266·4528` ·
 * API: `GET /api/v1/reports/latest`. AI 추천(버티기/이동)에 따라
 * 추천 타이틀과 대체 상권 섹션(HOT상권 / 추천 대체 상권)이 갈리고,
 * 리포트 PRO 구독 전이면 헤더만 남기고 본문 전체가 블러로 잠긴다(결제 유도 카드).
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

/** 구독 전 — 헤더 아래 본문 전체가 블러로 덮이고 결제 유도 카드만 뜬다 */
export const Locked: Story = {
  name: '구독 전 (잠금)',
  decorators: [decorator('이동', false)],
}

/**
 * 구독 전 · 리포트 도착 전 — 잠금 카드는 그대로 뜨고 배경만 스켈레톤 블러.
 * 실제로는 리포트가 도착하면 배경만 본문 블러로 조용히 바뀐다.
 */
export const LockedLoading: Story = {
  name: '구독 전 (배경 로딩)',
  decorators: [
    (Story) => {
      seedAuthedUser(false)
      // 시드 없는 클라이언트 — 네트워크가 없어 latest 가 영원히 pending 이다
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      })
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      )
    },
  ],
}
