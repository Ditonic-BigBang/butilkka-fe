import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Checkbox } from './Checkbox'

/** 체크박스 — 체크=key 채움 / 미체크=gray-200 테두리. Figma: 약관 동의 285:4662. */
const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '체크박스 — 약관 동의 등 불리언 선택. **Figma:** `285:4662` (온보딩 약관 동의)',
          '',
          '| 상태 | 박스 | 체크 |',
          '|---|---|---|',
          '| 체크 | `key` 채움 | 흰색 |',
          '| 미체크 | 흰 배경 · `gray-200` 테두리 | `gray-200` |',
          '',
          '기본 `size-5`(20) · `rounded-4` — 전체 동의는 `className="size-[26px]"` 로 키운다.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checked: Story = { args: { checked: true, 'aria-label': '동의' } }
export const Unchecked: Story = { args: { checked: false, 'aria-label': '동의' } }
export const AllAgreeSize: Story = {
  args: { checked: true, className: 'size-[26px]', 'aria-label': '전체 동의' },
}
export const Disabled: Story = { args: { checked: false, disabled: true, 'aria-label': '동의' } }

function InteractiveCheckbox() {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        aria-label="[필수] 만 14세 이상입니다"
      />
      <span className="text-body-l-medium text-gray-900">[필수] 만 14세 이상입니다</span>
    </div>
  )
}

/** 클릭하면 체크 토글. */
export const Interactive: Story = {
  render: () => <InteractiveCheckbox />,
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole('checkbox')
    await expect(box).not.toBeChecked()
    await userEvent.click(box)
    await expect(box).toBeChecked()
  },
}
