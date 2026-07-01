import type { Meta, StoryObj } from '@storybook/react-vite'
import { SortTrigger } from './SortTrigger'

/** 정렬 트리거 — 라벨 + 방향 캐럿. Figma: Trigger_Sort Dropdown 267:5728. */
const meta = {
  title: 'UI/SortTrigger',
  component: SortTrigger,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '현재 정렬 라벨 + 방향 캐럿(▼/▲). **Figma:** `267:5728` (캐럿 `267:5745` 포함)',
          '',
          '| 요소 | 값 |',
          '|---|---|',
          '| 라벨 | `text-body-m-medium` · `gray-700` |',
          '| 캐럿 | `gray-300` · `direction=asc` 면 ▲(rotate-180) |',
          '| 간격 | `gap-1`(4) |',
        ].join('\n'),
      },
    },
  },
  args: { label: '최신순', direction: 'desc' },
  argTypes: { direction: { control: 'inline-radio', options: ['desc', 'asc'] } },
} satisfies Meta<typeof SortTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Desc: Story = { args: { direction: 'desc' } }
export const Asc: Story = { args: { direction: 'asc' } }
