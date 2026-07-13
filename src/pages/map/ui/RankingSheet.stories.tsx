import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { RankingOrder } from '@/entities/region'
import { RankingSheet } from './RankingSheet'
import type { RankingRow } from '../model/useDeclineRanking'

const TOP_ROWS: RankingRow[] = [
  { rank: 1, regionCode: '3110002', name: '서울 서대문구', grade: 'E', direction: 'up' },
  { rank: 2, regionCode: '3110003', name: '서울 광진구', grade: 'E', direction: 'down' },
  { rank: 3, regionCode: '3110004', name: '서울 노원구', grade: 'D', direction: 'up' },
  { rank: 4, regionCode: '3110005', name: '서울 용산구', grade: 'D', direction: 'same' },
  { rank: 5, regionCode: '3110006', name: '서울 강서구', grade: 'C', direction: 'down' },
]

const BOTTOM_ROWS: RankingRow[] = [
  { rank: 1, regionCode: '3110008', name: '서울 강남구', grade: 'A', direction: 'same' },
  { rank: 2, regionCode: '3110013', name: '서울 송파구', grade: 'A', direction: 'up' },
  { rank: 3, regionCode: '3110014', name: '서울 서초구', grade: 'A', direction: 'same' },
  { rank: 4, regionCode: '3110007', name: '서울 마포구', grade: 'B', direction: 'down' },
  { rank: 5, regionCode: '3110009', name: '서울 중구', grade: 'B', direction: 'up' },
]

/** 쇠퇴 등급 랭킹 바텀시트. Figma: 지도 홈 596:23182. */
const meta = {
  title: 'Map/RankingSheet',
  component: RankingSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '쇠퇴 등급 랭킹 바텀시트. **Figma:** `596:23182`',
          '',
          '- 지도 위 상시 노출 비모달 시트 — 핸들·헤더 탭/드래그로 펼침·접힘',
          '- 정렬 탭(위험 높은 순 `top` / 안전한 순 `bottom`) + `DistrictRankRow` Top5',
        ].join('\n'),
      },
    },
  },
  args: { order: 'top', onOrderChange: () => {}, rows: TOP_ROWS },
} satisfies Meta<typeof RankingSheet>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 (접힘 상태 — 핸들/헤더 탭으로 펼침). */
export const Default: Story = { name: '기본' }

function InteractiveDemo() {
  const [order, setOrder] = useState<RankingOrder>('top')
  return (
    <div className="flex h-[400px] flex-col justify-end bg-gray-100">
      <RankingSheet
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
