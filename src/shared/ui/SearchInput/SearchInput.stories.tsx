import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { SearchInput } from './SearchInput'

/** 검색 입력 — controlled. 포커스 시 ‹back, 값 있으면 ✕clear. Figma: Search Bar 176:2650. */
const meta = {
  title: 'UI/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '검색 입력 (Figma `176:2650`). 4상태 = 한 입력의 라이프사이클.',
          '',
          '| 상태 | 좌측 | 텍스트 | 우측 |',
          '|---|---|---|---|',
          '| Default | 🔍 `gray-300` | placeholder `gray-300` | — |',
          '| Selected(포커스) | ‹ back `gray-900` | placeholder | — |',
          '| Typing | ‹ back | 값 `gray-900` | — |',
          '| Result | 🔍 `gray-900` | 값 | ✕ (`gray-300` 원) |',
          '',
          '컨테이너: `h-12` · `rounded-8` · `bg-gray-70` · `px-4` · `gap-2.5`. 검색 동작은 상위 feature.',
        ].join('\n'),
      },
    },
  },
  args: { onChange: () => {}, value: '' },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

/** 실제 동작 — 입력/포커스/지우기 다 됨. */
function InteractiveSearch() {
  const [value, setValue] = useState('')
  return <SearchInput value={value} onChange={setValue} onBack={() => setValue('')} />
}
export const Interactive: Story = {
  render: () => <InteractiveSearch />,
  play: async ({ canvas, userEvent, step }) => {
    const input = canvas.getByRole('searchbox')

    await step('포커스 → 좌측 ‹(검색 취소) 버튼 노출', async () => {
      await userEvent.click(input)
      await expect(canvas.getByRole('button', { name: '검색 취소' })).toBeInTheDocument()
    })

    await step('입력 → 값 반영 + 지우기 버튼', async () => {
      await userEvent.type(input, '서대')
      await expect(input).toHaveValue('서대')
      await expect(canvas.getByRole('button', { name: '지우기' })).toBeInTheDocument()
    })

    await step('지우기 → 비움', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '지우기' }))
      await expect(input).toHaveValue('')
    })
  },
}

/** 빈 상태 (Default) */
export const Empty: Story = { args: { value: '' } }

/** 값 있음 (Result) — 🔍 + 값 + ✕ */
export const WithValue: Story = { args: { value: '서대문구' } }
