import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportCard } from './ReportCard'

/** 리포트 카드. Figma: Card_M_리포트 상세보기 372:15244. */
const meta = {
  title: 'Report/ReportCard',
  component: ReportCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '리포트 카드 (탭 → 상세). **Figma:** `372:15244` (Not Read / Read)',
          '',
          '- 문서 아이콘(`info-blue`) + 분기(12px gray-500) · 제목(16px semibold gray-900) · 요약(14px gray-700)',
          '- 우측 chevron(gray-300)',
          '- **안 읽음**: `info-blue-soft` 배경 강조 / **읽음**: 흰 배경 (배경만 차이)',
        ].join('\n'),
      },
    },
  },
  args: {
    quarter: '2026년 1분기',
    title: '2026년 1분기 분석 리포트',
    summary: '상권 점수는 B등급이며,\n유동인구가 1.4% 증가했어요.',
    onClick: () => {},
  },
} satisfies Meta<typeof ReportCard>

export default meta
type Story = StoryObj<typeof meta>

/** 안 읽음 — soft-blue 배경 강조. */
export const NotRead: Story = {
  name: '안 읽음',
  args: { read: false },
}

/** 읽음 — 흰 배경. */
export const Read: Story = {
  name: '읽음',
  args: { read: true },
}

/** 리스트 — 안 읽음(강조) + 읽음 섞임. */
export const List: Story = {
  name: '리스트',
  render: (args) => (
    <div className="w-full">
      <ReportCard {...args} read={false} />
      <ReportCard
        quarter="2025년 4분기"
        title="2025년 4분기 분석 리포트"
        summary={'상권 점수는 C등급이며,\n폐업률이 2.1% 늘었어요.'}
        read
      />
      <ReportCard
        quarter="2025년 3분기"
        title="2025년 3분기 분석 리포트"
        summary={'상권 점수는 B등급이며,\n임대료가 0.8% 하락했어요.'}
        read
      />
    </div>
  ),
}
