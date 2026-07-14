import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import type { TrendPoint } from '@/shared/ui'
import { DistrictSheet } from './DistrictSheet'

const YEAR_TICKS = ['2024', '2025', '2026']

const VALUE_TREND: TrendPoint[] = [
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

const GRADE_TREND: TrendPoint[] = [
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

const RANKING = [
  { rank: 1, name: '서울 서대문구', grade: 'E', direction: 'up' as const },
  { rank: 2, name: '서울 광진구', grade: 'E', direction: 'down' as const },
  { rank: 3, name: '서울 노원구', grade: 'D', direction: 'up' as const },
  { rank: 4, name: '서울 용산구', grade: 'D', direction: 'same' as const },
  { rank: 5, name: '서울 강서구', grade: 'C', direction: 'down' as const },
]

type DemoProps = Parameters<typeof DistrictSheet>[0]

function Demo({ title, subtitle, content }: Omit<DemoProps, 'open' | 'onClose'>) {
  const [open, setOpen] = useState(true)
  return (
    <div className="relative flex h-dvh flex-col items-center bg-gray-100 p-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-8 bg-key px-4 py-2 text-body-m-semibold text-white"
      >
        바텀시트 열기
      </button>
      <DistrictSheet
        open={open}
        onClose={() => setOpen(false)}
        className="absolute inset-x-0 bottom-0"
        title={title}
        subtitle={subtitle}
        content={content}
      />
    </div>
  )
}

/** 상권 분석 바텀시트. Figma: Bottom Sheet 353:10218. */
const meta = {
  title: 'Widgets/DistrictSheet',
  component: DistrictSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '상권 분석 바텀시트 (4개 변형). **Figma:** `353:10218`',
          '',
          '- **ranking**: 세그먼트 탭 + 순위 리스트 + 평균 영업 기간 (All)',
          '- **grade**: 반원 게이지 + 지난 분기 pill + 3년 추이 등급 (Grade)',
          '- **metric**: 값 + 증감칩 + 3년 추이 값 (+평균 영업 기간) (Graph / Graph_Period)',
        ].join('\n'),
      },
    },
  },
  args: { open: false, title: '', subtitle: '', content: { type: 'ranking', ranking: [] } },
} satisfies Meta<typeof DistrictSheet>

export default meta
type Story = StoryObj<typeof meta>

/** All — 순위 리스트 + 평균 영업 기간. */
export const Ranking: Story = {
  name: 'All (순위)',
  render: () => (
    <Demo
      title="쇠퇴 등급"
      subtitle="서울 전체"
      content={{
        type: 'ranking',
        tabs: ['위험 높은 순', '안전한 순'],
        ranking: RANKING,
        averagePeriod: { label: '서울 전체', years: '5.9' },
      }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('region', { name: '쇠퇴 등급' })).toBeInTheDocument()
    await expect(await canvas.findByText('서울 서대문구')).toBeInTheDocument()
    await expect(await canvas.findByText('평균 영업 기간')).toBeInTheDocument()
  },
}

/** Grade — 반원 게이지 + 3년 추이 등급. */
export const Grade: Story = {
  name: 'Grade (등급)',
  render: () => (
    <Demo
      title="쇠퇴 등급"
      subtitle="서울 서대문구"
      content={{
        type: 'grade',
        quarter: '26년 1분기',
        grade: 'C',
        status: '주의',
        lastGrade: 'B등급',
        trend: GRADE_TREND,
        trendTicks: YEAR_TICKS,
      }}
    />
  ),
}

/** Graph — 값 + 증감칩 + 3년 추이. */
export const Metric: Story = {
  name: 'Graph (값)',
  render: () => (
    <Demo
      title="매출 대비 임대료"
      subtitle="서울 서대문구"
      content={{
        type: 'metric',
        quarter: '26년 1분기',
        value: '134,302',
        unit: '명',
        comparison: { label: '이전 분기 대비', percent: '5%', direction: 'down' },
        trend: VALUE_TREND,
        trendTicks: YEAR_TICKS,
        trendUnit: '(명)',
        trendTooltip: (p) => `${p.value.toLocaleString()}명`,
        yFormatter: (v) => `${Math.round(v / 10000)}만`,
      }}
    />
  ),
}

/** Graph_Period — 값 + 3년 추이 + 평균 영업 기간. */
export const MetricWithPeriod: Story = {
  name: 'Graph_Period (값+기간)',
  render: () => (
    <Demo
      title="매출 대비 임대료"
      subtitle="서울 서대문구"
      content={{
        type: 'metric',
        quarter: '26년 1분기',
        value: '134,302',
        unit: '명',
        comparison: { label: '이전 분기 대비', percent: '5%', direction: 'down' },
        trend: VALUE_TREND,
        trendTicks: YEAR_TICKS,
        trendUnit: '(명)',
        trendTooltip: (p) => `${p.value.toLocaleString()}명`,
        yFormatter: (v) => `${Math.round(v / 10000)}만`,
        averagePeriod: { label: '서울 서대문구', years: '4.2' },
      }}
    />
  ),
}
