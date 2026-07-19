import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { RankingOrder } from '@/entities/region'
import { RankingSheet } from './RankingSheet'
import type { RankingRow } from '../model/useRanking'

const TOP_ROWS: RankingRow[] = [
  {
    rank: 1,
    regionCode: '3110002',
    name: '서울 서대문구',
    value: 'E',
    unit: '등급',
    direction: 'up',
  },
  {
    rank: 2,
    regionCode: '3110003',
    name: '서울 광진구',
    value: 'E',
    unit: '등급',
    direction: 'down',
  },
  {
    rank: 3,
    regionCode: '3110004',
    name: '서울 노원구',
    value: 'D',
    unit: '등급',
    direction: 'up',
  },
  {
    rank: 4,
    regionCode: '3110005',
    name: '서울 용산구',
    value: 'D',
    unit: '등급',
    direction: 'same',
  },
  {
    rank: 5,
    regionCode: '3110006',
    name: '서울 강서구',
    value: 'C',
    unit: '등급',
    direction: 'down',
  },
]

const BOTTOM_ROWS: RankingRow[] = [
  {
    rank: 1,
    regionCode: '3110008',
    name: '서울 강남구',
    value: 'A',
    unit: '등급',
    direction: 'same',
  },
  {
    rank: 2,
    regionCode: '3110013',
    name: '서울 송파구',
    value: 'A',
    unit: '등급',
    direction: 'up',
  },
  {
    rank: 3,
    regionCode: '3110014',
    name: '서울 서초구',
    value: 'A',
    unit: '등급',
    direction: 'same',
  },
  {
    rank: 4,
    regionCode: '3110007',
    name: '서울 마포구',
    value: 'B',
    unit: '등급',
    direction: 'down',
  },
  { rank: 5, regionCode: '3110009', name: '서울 중구', value: 'B', unit: '등급', direction: 'up' },
]

const METRIC_ROWS: RankingRow[] = [
  {
    rank: 1,
    regionCode: '3110002',
    name: '서울 서대문구',
    value: '10,000',
    unit: '만원',
    direction: 'up',
  },
  {
    rank: 2,
    regionCode: '3110003',
    name: '서울 광진구',
    value: '9,000',
    unit: '만원',
    direction: 'down',
  },
  {
    rank: 3,
    regionCode: '3110004',
    name: '서울 노원구',
    value: '8,000',
    unit: '만원',
    direction: 'up',
  },
  {
    rank: 4,
    regionCode: '3110005',
    name: '서울 용산구',
    value: '7,000',
    unit: '만원',
    direction: 'same',
  },
  {
    rank: 5,
    regionCode: '3110006',
    name: '서울 강서구',
    value: '6,000',
    unit: '만원',
    direction: 'down',
  },
]

/** 카테고리별 랭킹 바텀시트. Figma: 지도 홈 596:23182 · 지표 255:2413. */
const meta = {
  title: 'Map/RankingSheet',
  component: RankingSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '카테고리별 랭킹 바텀시트. **Figma:** `596:23182`(쇠퇴등급) · `255:2413`(지표)',
          '',
          '- 지도 위 상시 노출 비모달 시트 — 핸들·헤더 탭/드래그로 펼침·접힘',
          '- 카테고리별 제목·정렬 탭 라벨 + `DistrictRankRow` Top5 (등급 또는 값·단위)',
        ].join('\n'),
      },
    },
  },
  args: {
    title: '쇠퇴 등급',
    tabs: ['위험 높은 순', '안전한 순'],
    order: 'top',
    onOrderChange: () => {},
    rows: TOP_ROWS,
  },
} satisfies Meta<typeof RankingSheet>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 (접힘 상태 — 핸들/헤더 탭으로 펼침). */
export const Default: Story = { name: '기본' }

/** 지표 카테고리 (점포당 평균 분기매출) — 상위/하위 5위 탭 + 값·단위 행. */
export const Metric: Story = {
  name: '지표 (점포당 평균 분기매출)',
  args: { title: '점포당 평균 분기매출', tabs: ['상위 5위', '하위 5위'], rows: METRIC_ROWS },
}

function InteractiveDemo() {
  const [order, setOrder] = useState<RankingOrder>('top')
  return (
    <div className="flex h-[400px] flex-col justify-end bg-gray-100">
      <RankingSheet
        title="쇠퇴 등급"
        tabs={['위험 높은 순', '안전한 순']}
        order={order}
        onOrderChange={setOrder}
        rows={order === 'top' ? TOP_ROWS : BOTTOM_ROWS}
      />
    </div>
  )
}

/** 탭 전환 동작 포함 인터랙티브. */
export const Interactive: Story = {
  name: '인터랙티브',
  render: () => <InteractiveDemo />,
}
