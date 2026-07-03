import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { TrendGraph, type TrendPoint } from './TrendGraph'

const YEAR_TICKS = ['2024', '2025', '2026']

const VALUE_DATA: TrendPoint[] = [
  { label: 's', value: 150000 },
  { label: '2024', value: 158000 },
  { label: 'a', value: 149000 },
  { label: 'b', value: 153000 },
  { label: '2025', value: 145000 },
  { label: 'c', value: 138000 },
  { label: 'd', value: 141000 },
  { label: '2026', value: 136000 },
  { label: 'e', value: 134302 },
]

const PERCENT_DATA: TrendPoint[] = [
  { label: 's', value: 26 },
  { label: '2024', value: 29 },
  { label: 'a', value: 22 },
  { label: 'b', value: 24 },
  { label: '2025', value: 21 },
  { label: 'c', value: 17 },
  { label: 'd', value: 18 },
  { label: '2026', value: 16 },
  { label: 'e', value: 13 },
]

const GRADE_DATA: TrendPoint[] = [
  { label: 's', value: 5 },
  { label: '2024', value: 5 },
  { label: 'a', value: 4 },
  { label: 'b', value: 4 },
  { label: '2025', value: 3 },
  { label: 'c', value: 4 },
  { label: 'd', value: 2 },
  { label: '2026', value: 4 },
  { label: 'e', value: 3 },
]

/** 3년 추이 영역 차트 (recharts). Figma: 3years_Graph 353:9295. */
const meta = {
  title: 'Shared/TrendGraph',
  component: TrendGraph,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '3년 추이 영역 차트 (recharts). **Figma:** `353:9295`',
          '',
          '- 오렌지 라인 + 그라데이션 fill + 점선 그리드 + 우측 y축',
          '- **value**: 숫자 y축 · **grade**: A~E y축',
          '- `highlightLabel` 지정 시 마지막 점에 마커·세로선·다크 pill',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[361px] bg-white p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    title: '3년 추이',
    data: VALUE_DATA,
    xTicks: YEAR_TICKS,
  },
} satisfies Meta<typeof TrendGraph>

export default meta
type Story = StoryObj<typeof meta>

/** 값 + 툴팁 (매출 대비 임대료). */
export const Value: Story = {
  name: '값 (툴팁)',
  args: {
    unit: '(명)',
    highlightLabel: '134,302명',
    yFormatter: (v) => `${Math.round(v / 10000)}만`,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('3년 추이')).toBeInTheDocument()
    await expect(await canvas.findByText('134,302명')).toBeInTheDocument()
  },
}

/** 값 + 퍼센트 툴팁. */
export const Percent: Story = {
  name: '값 (퍼센트)',
  args: {
    data: PERCENT_DATA,
    highlightLabel: '13%',
    yFormatter: (v) => `${v}`,
  },
}

/** 등급 (A~E). */
export const Grade: Story = {
  name: '등급 (A~E)',
  args: {
    variant: 'grade',
    data: GRADE_DATA,
  },
}
