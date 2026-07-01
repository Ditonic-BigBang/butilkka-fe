import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Dropdown } from './Dropdown'
import { DropdownOption } from './DropdownOption'

/** 드롭다운 목록 — Dropdown(컨테이너) + DropdownOption(행). Figma: 267:5719 / 267:5739. */
const meta = {
  title: 'UI/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '`Dropdown`(카드) 안에 `DropdownOption`(행)을 조합. **Figma:** `267:5719`(컨테이너) · `267:5739`(옵션)',
          '',
          '| 요소 | 값 |',
          '|---|---|',
          '| Dropdown | `w-40`(160) · `rounded-12` · `bg-white` · `shadow-card` |',
          '| DropdownOption | `h-12`(48) · `px-4` · `text-body-m-medium` · `gray-800` |',
          '| selected 체크 | `ci/check` · `info-blue` · 우측 |',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

const OPTIONS = ['최신순', '오래된순']

function InteractiveDropdown() {
  const [selected, setSelected] = useState('최신순')
  return (
    <Dropdown>
      {OPTIONS.map((o) => (
        <DropdownOption key={o} selected={selected === o} onClick={() => setSelected(o)}>
          {o}
        </DropdownOption>
      ))}
    </Dropdown>
  )
}

/** 클릭하면 선택(파란 체크)이 옮겨감. */
export const Default: Story = {
  render: () => <InteractiveDropdown />,
  play: async ({ canvas, userEvent }) => {
    const latest = canvas.getByRole('button', { name: '최신순' })
    const oldest = canvas.getByRole('button', { name: '오래된순' })
    await expect(latest).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(oldest)
    await expect(oldest).toHaveAttribute('aria-pressed', 'true')
    await expect(latest).toHaveAttribute('aria-pressed', 'false')
  },
}
