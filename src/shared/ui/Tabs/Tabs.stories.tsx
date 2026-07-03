import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Tabs } from './Tabs'

const SORT_OPTIONS = [
  { value: 'risk', label: '위험 높은 순' },
  { value: 'safe', label: '안전한 순' },
]

/** 세그먼트 탭 (정렬 토글 등). Figma: Tabs 477:12490. */
const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '세그먼트 탭 (단일 선택). **Figma:** `477:12490`',
          '',
          '- `gray-70` 트랙(radius-12) + 균등폭 세그먼트',
          '- 활성: **흰 pill**(radius-8) + `gray-900`, 비활성: 투명 + `gray-400`',
          '- 14px semibold. `role="tablist"`/`tab` + `aria-selected`',
        ].join('\n'),
      },
    },
  },
  // 필수 props 타입 충족용 (각 스토리는 render 로 controlled 래퍼가 덮어씀)
  args: { options: SORT_OPTIONS, value: 'risk', onChange: () => {} },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

function ControlledTabs({ initial = 'risk' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <Tabs options={SORT_OPTIONS} value={value} onChange={setValue} />
}

/** Default — "위험 높은 순" 활성. */
export const Default: Story = {
  name: 'Default (위험 높은 순)',
  render: () => <ControlledTabs initial="risk" />,
}

/** Variant2 — "안전한 순" 활성. */
export const Variant2: Story = {
  name: 'Variant2 (안전한 순)',
  render: () => <ControlledTabs initial="safe" />,
}

/** 탭 전환 — 다른 세그먼트 탭하면 활성 이동. */
export const Interaction: Story = {
  name: '탭 전환',
  render: () => <ControlledTabs initial="risk" />,
  play: async ({ canvas, userEvent }) => {
    const safe = canvas.getByRole('tab', { name: '안전한 순' })
    await expect(safe).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(safe)
    await expect(safe).toHaveAttribute('aria-selected', 'true')
  },
}
