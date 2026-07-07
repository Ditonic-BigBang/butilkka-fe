import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Calendar } from './Calendar'

// 스토리 결정성 위해 고정 달
const JAN_2025 = new Date(2025, 0, 15)

/** 월 단위 커스텀 캘린더. */
const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '월 단위 커스텀 캘린더 (라이브러리 없음).',
          '',
          '- 월 이동 `◀▶`, 일~토, 6주 그리드',
          '- 선택일 **오렌지 원 + 흰 글자**, 오늘 **키 컬러 글자**, 이전/다음 달 `gray-300`',
          '- 팝업/시트는 `DatePicker` 담당 — 이건 순수 그리드',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

function ControlledCalendar({ initial }: { initial?: Date }) {
  const [value, setValue] = useState<Date | undefined>(initial)
  return (
    <div className="w-[320px]">
      <Calendar value={value} defaultMonth={JAN_2025} onSelect={setValue} />
    </div>
  )
}

/** 선택된 날짜(오렌지) 표시. */
export const Default: Story = {
  name: '기본 (2025년 1월)',
  render: () => <ControlledCalendar initial={JAN_2025} />,
}

/** 날짜 탭 → 선택 반영(aria-pressed). */
export const Interaction: Story = {
  name: '날짜 선택',
  render: () => <ControlledCalendar initial={JAN_2025} />,
  play: async ({ canvas, userEvent }) => {
    const day20 = canvas.getByRole('button', { name: '2025년 1월 20일' })
    await userEvent.click(day20)
    await expect(day20).toHaveAttribute('aria-pressed', 'true')
  },
}
