import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Toggle } from './Toggle'

/** 토글 스위치 — ON=key / OFF=gray-200. Figma: Toggle 286:4972. */
const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '토글 스위치 — 제어/비제어 겸용. **Figma:** `286:4972`',
          '',
          '| 상태 | 트랙 | 썸 위치 |',
          '|---|---|---|',
          '| ON | `key` | 우측 (`left-[22px]`) |',
          '| OFF | `gray-200` | 좌측 (`left-0.5`) |',
          '',
          '크기: `w-11`(44) · `h-6`(24) · `rounded-max` · 썸 `size-5`(20) 흰색.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const On: Story = { args: { checked: true, 'aria-label': '알림' } }
export const Off: Story = { args: { checked: false, 'aria-label': '알림' } }
export const Disabled: Story = { args: { checked: true, disabled: true, 'aria-label': '알림' } }

function InteractiveToggle() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <Toggle checked={on} onCheckedChange={setOn} aria-label="마이페이지 알림" />
      <span className="text-body-m-medium text-gray-700">{on ? 'ON' : 'OFF'}</span>
    </div>
  )
}

/** 비제어 — 클릭하면 토글. */
export const Interactive: Story = {
  render: () => <InteractiveToggle />,
  play: async ({ canvas, userEvent }) => {
    const sw = canvas.getByRole('switch')
    await expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    await expect(sw).toHaveAttribute('aria-checked', 'true')
    await expect(canvas.getByText('ON')).toBeInTheDocument()
  },
}
