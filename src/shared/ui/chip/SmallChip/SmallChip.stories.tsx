import type { Meta, StoryObj } from '@storybook/react-vite'
import { SmallChip } from './SmallChip'

/** 작은 칩 — light/solid/outline. Figma: 칩바_리포트 상세보기 267:5870. */
const meta = {
  title: 'UI/SmallChip',
  component: SmallChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '리포트 상세 등에서 쓰는 소형 라벨. **Figma:** `267:5870`',
          '',
          '| variant | 배경 | 텍스트 | 테두리 |',
          '|---|---|---|---|',
          '| light | `gray-90` | `gray-500` | — |',
          '| solid | `gray-700` | `white` | — |',
          '| outline | — | `gray-800` | `gray-700` |',
          '',
          '크기: `rounded-6` · `px-3 py-2`(12·8) · `text-caption-l-regular`. 필터 pill 은 `FilterChip`.',
        ].join('\n'),
      },
    },
  },
  args: { children: '정부', variant: 'light' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['light', 'solid', 'outline'] },
  },
} satisfies Meta<typeof SmallChip>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = { args: { variant: 'light' } }
export const Solid: Story = { args: { variant: 'solid' } }
export const Outline: Story = { args: { variant: 'outline' } }

export const Row: Story = {
  render: () => (
    <div className="flex gap-2">
      <SmallChip variant="light">정부</SmallChip>
      <SmallChip variant="solid">정부</SmallChip>
      <SmallChip variant="outline">정부</SmallChip>
    </div>
  ),
}
