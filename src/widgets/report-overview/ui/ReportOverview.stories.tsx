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
        {/* ReportPage 헤더의 로딩 상태 복제 — 전체 로딩 화면 확인용 (원본: pages/report ReportHeader) */}
        <header className="flex items-end gap-2.5 bg-gray-70 px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-title-s-semibold text-gray-900">AI 리포트</h1>
            <span className="flex h-[21px] items-center">
              <span aria-hidden className="block h-3.5 w-36 skeleton rounded-full" />
            </span>
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
