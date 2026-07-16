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
          '- **value**: 숫자 y축 · **grade**: A~E y축 + 기본 등급 pill',
          '- 값 그래프는 `tooltipFormatter` 지정 시, 등급 그래프는 기본으로 포인트 선택 — 탭 전엔 표시 없음,',
          '  탭하면 해당 포인트에 세로 점선·흰 점·pill(점 위). 다른 곳 탭하면 이동',
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

/** 값 — 선택 전 (탭하면 포인트 선택). */
export const Value: Story = {
  name: '값 (선택 전)',
  args: {
    unit: '(명)',
    tooltipFormatter: (p) => `${p.value.toLocaleString()}명`,
    yFormatter: (v) => `${Math.round(v / 10000)}만`,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('3년 추이')).toBeInTheDocument()
    await expect(canvas.getAllByText(/만$/)).toHaveLength(5)
    await expect(canvas.queryByText('0만')).not.toBeInTheDocument()
    await expect(await canvas.findByText('13만')).toBeInTheDocument()
    await expect(await canvas.findByText('17만')).toBeInTheDocument()
    // 선택 전엔 pill 없음
    await expect(canvas.queryByText(/명$/)).not.toBeInTheDocument()
  },
}

/** 값 — 선택된 상태 (마지막 포인트). */
export const ValueSelected: Story = {
  name: '값 (선택됨)',
  args: {
    unit: '(명)',
    tooltipFormatter: (p) => `${p.value.toLocaleString()}명`,
    defaultActiveIndex: VALUE_DATA.length - 1,
    yFormatter: (v) => `${Math.round(v / 10000)}만`,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('134,302명')).toBeInTheDocument()
  },
}

/** 첫 포인트 선택 — 활성 원이 차트 왼쪽 경계에 잘리지 않는다. */
export const FirstPointSelected: Story = {
  name: '값 (첫 포인트 선택됨)',
  args: {
    unit: '(명)',
    tooltipFormatter: (p) => `${p.value.toLocaleString()}명`,
    defaultActiveIndex: 0,
    yFormatter: (v) => `${Math.round(v / 10000)}만`,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText('150,000명')).toBeInTheDocument()

    const activeDot = canvasElement.querySelector<SVGCircleElement>(
      '.recharts-reference-dot circle',
    )
    if (!activeDot) throw new Error('선택된 첫 포인트를 찾지 못함')

    const centerX = Number(activeDot.getAttribute('cx'))
    const radius = Number(activeDot.getAttribute('r'))
    const strokeWidth = Number(activeDot.getAttribute('stroke-width'))
    await expect(centerX).toBeGreaterThanOrEqual(radius + strokeWidth / 2)
  },
}

/** 값 + 퍼센트 pill (선택됨). */
export const Percent: Story = {
  name: '값 (퍼센트)',
  args: {
    data: PERCENT_DATA,
    tooltipFormatter: (p) => `${p.value}%`,
    defaultActiveIndex: PERCENT_DATA.length - 1,
    yFormatter: (v) => `${v}`,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('10')).toBeInTheDocument()
    await expect(await canvas.findByText('30')).toBeInTheDocument()
  },
}

/** 탭 → 해당 포인트 선택 (세로선·점·pill). */
export const TapToSelect: Story = {
  name: '탭 선택',
  args: {
    unit: '(명)',
    tooltipFormatter: (p) => `${p.value.toLocaleString()}명`,
    yFormatter: (v) => `${Math.round(v / 10000)}만`,
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.queryByText(/명$/)).not.toBeInTheDocument()
    const surface = canvasElement.querySelector('.recharts-surface')
    if (!surface) throw new Error('recharts surface 를 찾지 못함')
    const touchTarget = canvas.getByTestId('trend-graph-touch-target')
    await expect(surface).not.toHaveAttribute('tabindex')
    await userEvent.click(touchTarget)
    await expect(document.activeElement).not.toBe(touchTarget)
    await expect(document.activeElement).not.toBe(surface)
    await expect(await canvas.findByText(/명$/)).toBeInTheDocument()
  },
}

/** 등급 (A~E). */
export const Grade: Story = {
  name: '등급 (A~E)',
  args: {
    variant: 'grade',
    data: GRADE_DATA,
  },
  play: async ({ canvas, userEvent }) => {
    await Promise.all(
      ['A', 'B', 'C', 'D', 'E'].map(async (label) =>
        expect(await canvas.findByText(label)).toBeInTheDocument(),
      ),
    )
    await expect(canvas.queryByText(/[A-E]등급$/)).not.toBeInTheDocument()
    const touchTarget = canvas.getByTestId('trend-graph-touch-target')
    await userEvent.click(touchTarget)
    await expect(await canvas.findByText(/[A-E]등급$/)).toBeInTheDocument()
  },
}
