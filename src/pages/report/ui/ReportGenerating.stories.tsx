import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportGenerating } from './ReportGenerating'

/**
 * AI 리포트 생성 연출 — `GET /reports/latest` 가 10~15초 동기 생성하는 동안 표시.
 * 실제 화면과 동일하게 gray-70 배경 + 헤더(AI 리포트) 아래에서 확인한다.
 * 단계 문구 3초 간격 전환·진행 바 18초 수렴·20초 후 장기화 문구를 실시간으로 볼 수 있다.
 */
const meta = {
  title: 'Report/ReportGenerating',
  component: ReportGenerating,
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
} satisfies Meta<typeof ReportGenerating>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
