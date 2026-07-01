import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { PeriodChip } from './PeriodChip'

/** 기간(분기) 단일 선택 버튼 — 여러 개 중 하나 선택. Figma: 분기 선택 353:9059. */
const meta = {
  title: 'UI/PeriodChip',
  component: PeriodChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '여러 개 중 **하나만** 선택하는 네모형 버튼 (1분기·2분기…). **Figma:** `353:9059`',
          '',
          '| 상태 | 배경 | 텍스트 | 테두리 |',
          '|---|---|---|---|',
          '| 기본 | `white` | `gray-400` | `gray-100` |',
          '| selected | `orange-10` | `key` | `key` 1.4px |',
          '',
          '크기: `w-[85px]` · `rounded-8` · `px-[10px] py-3`(10·12) · `text-body-l-medium`.',
          '필터 바 칩은 `FilterChip`.',
        ].join('\n'),
      },
    },
  },
  args: { children: '1분기', selected: false },
  argTypes: { selected: { control: 'boolean' } },
} satisfies Meta<typeof PeriodChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { selected: true } }

function QuarterSelectorExample() {
  const [active, setActive] = useState(0)
  return (
    <div className="flex gap-2">
      {['1분기', '2분기', '3분기', '4분기'].map((q, i) => (
        <PeriodChip key={q} selected={active === i} onClick={() => setActive(i)}>
          {q}
        </PeriodChip>
      ))}
    </div>
  )
}

/** 분기 선택 바 — 하나만 selected 되는 실제 사용 예. */
export const Selector: Story = {
  render: () => <QuarterSelectorExample />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: '1분기' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(canvas.getByRole('button', { name: '2분기' }))
    await expect(canvas.getByRole('button', { name: '2분기' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(canvas.getByRole('button', { name: '1분기' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  },
}
