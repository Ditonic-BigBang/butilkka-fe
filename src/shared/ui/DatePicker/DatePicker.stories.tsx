import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { DatePicker } from './DatePicker'

const JAN_2025 = new Date(2025, 0, 15)

/** 날짜 선택 필드 + 바텀시트 캘린더. */
const meta = {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '날짜 선택 필드 (`TextField` date 변형 + 바텀시트 `Calendar`).',
          '',
          '필드 탭 → 하단에서 캘린더 시트가 올라오고, 날짜 탭 → 값 채우고 닫힘. 백드롭/✕ 로도 닫힘.',
          '값은 `Date`, 표시는 `YYYY.MM.DD`.',
        ].join('\n'),
      },
    },
  },
  args: { placeholder: '날짜를 선택해주세요' },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledPicker({ value: initial, ...props }: React.ComponentProps<typeof DatePicker>) {
  const [value, setValue] = useState<Date | undefined>(initial)
  return <DatePicker {...props} value={value} onChange={setValue} />
}

/** 빈 값 — 탭하면 오늘 기준 달이 열림. */
export const Empty: Story = {
  name: '빈 값',
  render: (args) => <ControlledPicker {...args} />,
}

/** 밑에 보조 설명(caption). */
export const WithCaption: Story = {
  name: '캡션',
  args: { caption: '추후에 변경할 수 있습니다.' },
  render: (args) => <ControlledPicker {...args} />,
}

/** 선택 플로우 — 필드 탭 → 시트 → 날짜 탭 → 값 반영 + 닫힘. */
export const PickFlow: Story = {
  name: '선택 플로우',
  args: { value: JAN_2025 },
  render: (args) => <ControlledPicker {...args} />,
  play: async ({ canvas, userEvent, step }) => {
    await step('필드 탭 → 시트 열림', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /2025\.01\.15/ }))
      await expect(canvas.getByRole('dialog', { name: '날짜 선택' })).toBeInTheDocument()
    })

    await step('날짜 탭 → 값 반영 + 시트 닫힘', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '2025년 1월 20일' }))
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: /2025\.01\.20/ })).toBeInTheDocument()
    })
  },
}
