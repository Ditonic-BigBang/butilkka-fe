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
      // 실제 화면처럼 flex 컬럼 — 연출(flex-1)이 헤더 아래 남은 높이를 채워 중앙 정렬
      <div className="flex h-screen flex-col bg-gray-70">
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
} satisfies Meta<typeof ReportGenerating>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
