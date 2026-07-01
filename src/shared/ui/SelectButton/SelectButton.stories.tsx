import type { Meta, StoryObj } from '@storybook/react-vite'
import { SelectButton } from './SelectButton'

/** 선택 버튼 — 업종 등 옵션 선택. Figma: 업종 353:8975. */
const meta = {
  title: 'UI/SelectButton',
  component: SelectButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '옵션 중 하나를 고르는 버튼 (업종 등). **Figma:** `353:8975`',
          '',
          '| 상태 | 테두리 | 텍스트 | 기타 |',
          '|---|---|---|---|',
          '| 기본 | `gray-100` 1.6px | `gray-600` | — |',
          '| selected | `key` 2px | `gray-900` | — |',
          '| disabled | `gray-100` 1.6px | `gray-600` | `opacity-60` |',
          '',
          '크기: `h-[50px]` · `w-[169px]`(고정) · `rounded-8` · `text-body-l-medium`.',
        ].join('\n'),
      },
    },
  },
  args: { children: '한식음식점', selected: false, disabled: false },
  argTypes: {
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SelectButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { selected: true } }
export const Disabled: Story = { args: { disabled: true } }

export const Grid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <SelectButton selected>한식음식점</SelectButton>
      <SelectButton>카페·음료</SelectButton>
      <SelectButton>편의점</SelectButton>
      <SelectButton disabled>주점</SelectButton>
    </div>
  ),
}
