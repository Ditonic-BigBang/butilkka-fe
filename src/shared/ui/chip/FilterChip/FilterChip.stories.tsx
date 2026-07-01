import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterChip } from './FilterChip'

/** 필터 바 칩 — selected × caret. Figma: Filter Chip 176:2563. */
const meta = {
  title: 'UI/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '필터 바에서 켜고 끄는 pill 칩 — `selected` × `caret`. **Figma:** `176:2563`',
          '',
          '| 상태 | 배경 | 텍스트 | 테두리 |',
          '|---|---|---|---|',
          '| 기본 | `white` | `gray-900` | `gray-100` |',
          '| selected | `orange-10` | `orange-600` | `orange-600` |',
          '',
          '크기: `h-9`(36) · `rounded-max` · `px-[14px]` · `text-body-m-medium`.',
          '`caret` → `pr-2` + `~icons/ci/chevron-down`. 단일 선택 버튼은 `PeriodChip`.',
        ].join('\n'),
      },
    },
  },
  args: { children: '필터', selected: false },
  argTypes: {
    selected: { control: 'boolean' },
    caret: { control: 'boolean' },
  },
} satisfies Meta<typeof FilterChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: '필터' } }
export const Selected: Story = { args: { children: '필터', selected: true } }
export const WithCaret: Story = { args: { children: '기간', caret: true } }
