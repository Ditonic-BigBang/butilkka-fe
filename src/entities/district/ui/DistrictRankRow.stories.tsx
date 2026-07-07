import type { Meta, StoryObj } from '@storybook/react-vite'
import { DistrictRankRow } from './DistrictRankRow'

const RANKING = [
  { rank: 1, name: '서울 서대문구', grade: 'E', direction: 'up' as const },
  { rank: 2, name: '서울 광진구', grade: 'E', direction: 'down' as const },
  { rank: 3, name: '서울 노원구', grade: 'D', direction: 'up' as const },
  { rank: 4, name: '서울 용산구', grade: 'D', direction: 'same' as const },
  { rank: 5, name: '서울 강서구', grade: 'C', direction: 'down' as const },
]

/** 순위 지역 리스트 행. Figma: Bottom Sheet All 176:2892. */
const meta = {
  title: 'District/DistrictRankRow',
  component: DistrictRankRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '순위 지역 리스트 행. **Figma:** `176:2892`',
          '',
          '- 순위 뱃지(orange-10) + 지역명 + 등급 + 증감 화살표(`ChangeIndicator` ▲빨강/▼파랑/–)',
          '- 랭킹 리스트에서 `divide-y divide-gray-90` 로 구분',
        ].join('\n'),
      },
    },
  },
  args: { rank: 1, name: '서울 서대문구', grade: 'E', direction: 'up' },
} satisfies Meta<typeof DistrictRankRow>

export default meta
type Story = StoryObj<typeof meta>

/** 단일 행. */
export const Default: Story = { name: '단일 행' }

/** 랭킹 리스트 (구분선). */
export const List: Story = {
  name: '랭킹 리스트',
  render: () => (
    <div className="w-[353px] divide-y divide-gray-90">
      {RANKING.map((d) => (
        <DistrictRankRow key={d.rank} {...d} />
      ))}
    </div>
  ),
}
