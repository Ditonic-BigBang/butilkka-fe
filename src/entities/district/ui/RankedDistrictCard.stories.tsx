import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { RankedDistrictCard } from './RankedDistrictCard'

const STATS = [
  { label: '점포수', value: '-4개', direction: 'down' as const, change: '감소' },
  { label: '유동인구', value: '-1,240', direction: 'down' as const, change: '명/일' },
  { label: '공실', value: '+2건', direction: 'up' as const, change: '증가' },
]

/** 순위 지역 드롭다운 카드. Figma: Dropdown_L 267:5750. */
const meta = {
  title: 'District/RankedDistrictCard',
  component: RankedDistrictCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '순위 지역 드롭다운 카드 (펼침/접힘). **Figma:** `267:5750`',
          '',
          '- **접힘**: 순위 뱃지 + 지역명 + 설명 + 펼침 화살표',
          '- 헤더 탭 → **펼침**: 스탯 타일(값 + `ChangeIndicator` ▲빨강/▼파랑) + 기준일 + [접기 · 지도에서 확인하기]',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-70 p-5">
        <Story />
      </div>
    ),
  ],
  args: {
    rank: 1,
    name: '망원동',
    description: '2026년 1분기부터 2분기까지 유동인구 증가율이 88% 증가했어요.',
    stats: STATS,
    referenceDate: '26.03 기준',
    onViewMap: () => {},
  },
} satisfies Meta<typeof RankedDistrictCard>

export default meta
type Story = StoryObj<typeof meta>

/** 접힘 — 순위·지역·설명만. */
export const Collapsed: Story = {
  name: '접힘',
  args: { defaultExpanded: false },
}

/** 펼침 — 스탯 + 기준일 + 버튼. */
export const Expanded: Story = {
  name: '펼침',
  args: { defaultExpanded: true },
}

/** 탭 → 펼쳐지며 스탯 노출. */
export const Interaction: Story = {
  name: '펼치기',
  args: { defaultExpanded: false },
  play: async ({ canvas, userEvent }) => {
    const header = canvas.getByRole('button', { expanded: false })
    await expect(canvas.queryByText('점포수')).not.toBeInTheDocument()
    await userEvent.click(header)
    await expect(canvas.getByText('점포수')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: '지도에서 확인하기' })).toBeInTheDocument()
  },
}
