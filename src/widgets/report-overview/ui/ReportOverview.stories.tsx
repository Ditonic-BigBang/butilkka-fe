import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportOverviewSkeleton } from './ReportOverview'

/**
 * 리포트 본문 로딩 스켈레톤 — `GET /reports/latest` 응답 대기 중 표시.
 * 실제 화면과 동일하게 gray-70 배경 + 헤더(AI 리포트) 아래에서 확인한다.
 * 각 카드가 실제 콘텐츠(점수·전망·원인·신호)의 내부 구조를 shimmer 블록으로 예고한다.
 */
const meta = {
  title: 'Report/ReportOverviewSkeleton',
  component: ReportOverviewSkeleton,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-70">
        {/* ReportPage 헤더 복제 — 상권·업종은 세션 가게 요약으로 선표시되므로 텍스트 상태 (원본: pages/report ReportHeader) */}
        <header className="flex items-end gap-2.5 bg-gray-70 px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-title-s-semibold text-gray-900">AI 리포트</h1>
            <div className="flex items-center gap-1 text-body-m-regular text-gray-400">
              <span>가로수길 인근</span>
              <span aria-hidden className="size-0.5 rounded-full bg-gray-200" />
              <span>한식음식점</span>
            </div>
          </div>
        </header>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportOverviewSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
