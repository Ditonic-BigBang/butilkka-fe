import type { Meta, StoryObj } from '@storybook/react-vite'
import { StoreCard } from './StoreCard'

/** 내 가게 카드. Figma: List_M_가게 1198:26538. */
const meta = {
  title: 'Store/StoreCard',
  component: StoreCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '내 가게 카드. **Figma:** `1198:26538`',
          '',
          '- (대표면) 상단 "현재 대표 위치" 오렌지 라벨',
          '- 빌딩 아이콘 + [창업일(gray-500) / 가게명(semibold) / 주소(gray-700)]',
          '- 하단 줄: **업종 칩**(선택) + **수정 · 삭제** 버튼(`OutlineButton`)',
        ].join('\n'),
      },
    },
  },
  args: {
    founded: '2022년 8월 12일 창업',
    name: '뽀짜이 베트남쌀국수 명동본점',
    address: '서울 중구 명동10길 52 신한익스페이스',
    category: '커피·음료',
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof StoreCard>

export default meta
type Story = StoryObj<typeof meta>

/** 대표 위치 — 상단 "현재 대표 위치" 라벨 + 업종 칩. */
export const Primary: Story = {
  name: '대표 위치',
  args: { primary: true },
}

/** 일반 — 대표 라벨 없음, 업종 칩만. */
export const Default: Story = {
  name: '일반',
  args: { primary: false },
}

/** 리스트 — 대표 위치 + 일반 가게 스택. */
export const List: Story = {
  name: '리스트',
  render: (args) => (
    <div className="w-full">
      <StoreCard {...args} primary />
      <StoreCard
        founded="2020년 3월 5일 창업"
        name="명동 칼국수 본점"
        address="서울 중구 명동8길 27"
        category="분식·면"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  ),
}
