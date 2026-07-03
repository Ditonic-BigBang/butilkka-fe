import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { TextField } from './TextField'

/** 온보딩 입력 필드. Figma: 온보딩_입력 353:8787. */
const meta = {
  title: 'UI/TextField',
  component: TextField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '온보딩 입력 필드. **Figma:** `353:8787` (Blank/Filled/Date/Date_Selected)',
          '',
          '- `gray-70` 배경 · 48px · radius-8 · 좌우 16px, 텍스트 16px',
          '- 값 있으면 `gray-900`, 없으면 placeholder `gray-300`',
          '- `text`: 값 있으면 우측 **지우기(✕)** 버튼',
          '- `date`: 우측 **캘린더 아이콘**(값 gray-600 / 빈값 gray-300), 클릭 시 `onPick`',
          '- `caption`: 필드 아래 `gray-300` 14px',
        ].join('\n'),
      },
    },
  },
  args: { placeholder: '도로명 또는 지번 입력' },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

// controlled 래퍼 (입력·지우기 동작 데모)
function ControlledText({
  initial = '',
  ...props
}: { initial?: string } & React.ComponentProps<typeof TextField>) {
  const [value, setValue] = useState(initial)
  return <TextField {...props} value={value} onChange={setValue} />
}

/** 빈 입력 — placeholder(gray-300). */
export const Blank: Story = {
  name: 'Blank (빈 입력)',
  render: (args) => <ControlledText {...args} />,
}

/** 값 입력 — 텍스트 gray-900 + 우측 지우기 버튼. (지우기 클릭 → 비워짐) */
export const Filled: Story = {
  name: 'Filled (값 + 지우기)',
  render: (args) => <ControlledText {...args} initial="뽀짜이 베트남쌀국수 명동본점" />,
  play: async ({ canvas, userEvent }) => {
    const clear = canvas.getByRole('button', { name: '지우기' })
    await expect(clear).toBeInTheDocument()
    await userEvent.click(clear)
    await expect(canvas.getByRole('textbox')).toHaveValue('')
  },
}

/** 입력 + 밑에 보조 설명(caption). */
export const WithCaption: Story = {
  name: '온보딩_입력 (캡션)',
  args: { caption: '추후에 변경할 수 있습니다.' },
  render: (args) => <ControlledText {...args} />,
}

/** 날짜 — 빈 값(placeholder + 캘린더 gray-300). */
export const DateEmpty: Story = {
  name: 'Date (빈 값)',
  args: { variant: 'date', placeholder: '날짜를 선택해주세요' },
}

/** 날짜 — 선택됨(값 gray-900 + 캘린더 gray-600). */
export const DateSelected: Story = {
  name: 'Date_Selected (선택됨)',
  args: { variant: 'date', value: '2025.01.15', placeholder: '날짜를 선택해주세요' },
}
