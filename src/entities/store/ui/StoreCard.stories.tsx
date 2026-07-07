import type { Meta, StoryObj } from '@storybook/react-vite'
import { StoreCard } from './StoreCard'

/** 내 가게 카드. Figma: List_M_가게 427:19595. */
const meta = {
  title: 'Store/StoreCard',
  component: StoreCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '내 가게 카드. **Figma:** `427:19595` (Default / Variant2)',
          '',
          '- 빌딩 아이콘 + [창업일(gray-500) + "현재 대표 위치" 칩(선택)] / 가게명(semibold) / 주소(gray-700)',
          '- 하단 **수정 · 삭제** 버튼(`OutlineButton` 재사용)',
          '- `primary` 여부로 대표 위치 칩 표시 (Default=칩 / Variant2=없음)',
        ].join('\n'),
      },
    },
  },
  args: {
    founded: '2022년 8월 창업',
    name: '뽀짜이 베트남쌀국수 명동본점',
    address: '서울 중구 명동10길 52 신한익스페이스',
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof StoreCard>

export default meta
type Story = StoryObj<typeof meta>

/** 대표 위치 — "현재 대표 위치" 칩 표시. (Figma Default) */
export const Primary: Story = {
  name: '대표 위치 (칩)',
  args: { primary: true },
}

/** 일반 — 칩 없음. (Figma Variant2) */
export const Default: Story = {
  name: '일반 (칩 없음)',
  args: { primary: false },
}

/** 리스트 — 대표 위치 + 일반 가게 스택. */
export const List: Story = {
  name: '리스트',
  render: (args) => (
    <div className="w-full">
      <StoreCard {...args} primary />
      <StoreCard
        founded="2020년 3월 창업"
        name="명동 칼국수 본점"
        address="서울 중구 명동8길 27"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  ),
}
