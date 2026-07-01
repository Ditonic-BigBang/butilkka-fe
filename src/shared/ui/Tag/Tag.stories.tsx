import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './Tag'

/** 정적 카테고리 태그 (Figma: Category Chip_업종). 선택 불가한 분류 라벨. */
const meta = {
  title: 'UI/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '정적 카테고리 라벨(선택 불가) — 업종·분류 표시용. **Figma:** `427:18727`',
          '',
          '| radius | padding | 폰트 | 배경 | 텍스트 |',
          '|---|---|---|---|---|',
          '| `rounded-max` | `px-3 py-1`(12·4) | `text-caption-l-medium` | `orange-50` | `orange-500` |',
        ].join('\n'),
      },
    },
  },
  args: { children: '카페·음료' },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const List: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tag>카페·음료</Tag>
      <Tag>음식점</Tag>
      <Tag>소매업</Tag>
    </div>
  ),
}
