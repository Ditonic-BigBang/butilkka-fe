import type { Meta, StoryObj } from '@storybook/react-vite'
import { OutlineButton } from './OutlineButton'

/** 아웃라인 버튼 — 작은 보조 액션(수정 등). Figma: Button수정 286:7430. */
const meta = {
  title: 'UI/OutlineButton',
  component: OutlineButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '작은 아웃라인 보조 버튼 (수정 등 짧은 라벨). **Figma:** `286:7430`',
          '',
          '| radius | padding | 폰트 | 배경 | 텍스트 | 테두리 |',
          '|---|---|---|---|---|---|',
          '| `rounded-10` | `px-3 py-1`(12·4) | `text-body-m-semibold` | `white` | `gray-700` | `gray-100` |',
        ].join('\n'),
      },
    },
  },
  args: { children: '수정' },
} satisfies Meta<typeof OutlineButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
