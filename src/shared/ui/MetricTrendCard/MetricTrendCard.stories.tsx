import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricTrendCard } from './MetricTrendCard'

const DOWN_TREND = [
  { label: '3분기', value: 152000 },
  { label: '4분기', value: 148000 },
  { label: '1분기', value: 134302 },
]

const UP_TREND = [
  { label: '3분기', value: 412 },
  { label: '4분기', value: 430 },
  { label: '1분기', value: 506 },
]

/** 홈 지표 추이 카드. Figma: Home_Graph 1390:14011 · 585:11172. */
const meta = {
  title: 'Shared/MetricTrendCard',
  component: MetricTrendCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '홈 지표 추이 카드 (보기 전용). **Figma:** `1390:14011` · `585:11172`',
          '',
          '- 제목 + 큰 값(28px) + 증감 칩(▲빨강 soft red / ▼파랑 soft blue, 값 아래 세로 배치)',
          '- 3포인트 스파크라인 — 세로 가이드선 + 라벨, 마지막 점 흰 링',
          '- **vertical**: 반폭, 차트 아래 (유동인구·점포수) · **horizontal**: 전폭, 차트 우측 (폐업률)',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-gray-70 p-5">
        <Story />
      </div>
    ),
  ],
  args: {
    title: '유동인구',
    value: '-18%',
    change: { direction: 'down', label: '1,215명' },
    trend: DOWN_TREND,
  },
} satisfies Meta<typeof MetricTrendCard>

export default meta
type Story = StoryObj<typeof meta>

/** 유동인구 — 세로, ▼파랑 칩. */
export const FloatingPopulation: Story = {
  name: '유동인구 (세로)',
  render: (args) => (
    <div className="w-[170px]">
      <MetricTrendCard {...args} />
    </div>
  ),
}

/** 긴 값 — 값이 길어도 칩이 아래라 안 밀린다 (Figma 1390:14011 예시). */
export const LongValue: Story = {
  name: '긴 값 (세로)',
  args: {
    value: '-9,299.31%',
    change: { direction: 'down', label: '15,289명' },
  },
  render: (args) => (
    <div className="w-[170px]">
      <MetricTrendCard {...args} />
    </div>
  ),
}

/** 폐업률 — 가로(전폭), 개수 칩 없음(디자인 변경). */
export const ClosureRate: Story = {
  name: '폐업률 (가로)',
  args: {
    title: '폐업률',
    value: '+18%',
    change: undefined, // meta 기본 칩을 덮어 개수 미표시
    trend: UP_TREND,
    layout: 'horizontal',
  },
}

/** 홈 배치 — 반폭 2개 + 전폭 1개. */
export const HomeLayout: Story = {
  name: '홈 배치',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricTrendCard
          title="유동인구"
          value="-18%"
          change={{ direction: 'down', label: '1,215명' }}
          trend={DOWN_TREND}
        />
        <MetricTrendCard
          title="점포수"
          value="-18%"
          change={{ direction: 'down', label: '47개' }}
          trend={DOWN_TREND}
        />
      </div>
      <MetricTrendCard title="폐업률" value="+18%" trend={UP_TREND} layout="horizontal" />
    </div>
  ),
}
