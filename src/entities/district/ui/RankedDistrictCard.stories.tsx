import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { RankedDistrictCard } from './RankedDistrictCard'

const STATS = [
  { label: '점포 수', value: '1,240개' },
  { label: '유동인구', value: '6,842만명' },
  { label: '공실률', value: '3.1%' },
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
          '- 헤더 탭 → **펼침**: 점포 수·유동인구·공실률 스탯 타일 + 기준 분기 + [접기 · 지도에서 확인하기]',
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
    name: '마포구',
    description:
      '마포구는 현재보다 양호한 상권으로 유동인구가 꾸준히 증가하고 있어 안정적인 매출이 기대됩니다.',
    stats: STATS,
    referenceDate: '2026년 2분기 기준',
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
    // 펼침 애니메이션(grid-rows)을 위해 항상 마운트 — 접힘은 invisible 로 숨김
    await expect(canvas.getByText('점포 수')).not.toBeVisible()
    await userEvent.click(header)
    // 펼침 전환(opacity) 완료를 기다린 뒤 확인
    await waitFor(() => expect(canvas.getByText('점포 수')).toBeVisible())
    await expect(canvas.getByRole('button', { name: '지도에서 확인하기' })).toBeInTheDocument()
  },
}
