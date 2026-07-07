import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { OutlinedInput } from './OutlinedInput'

/** 아웃라인 필드 (입력 + 트리거). Figma: List_S 301:5601. */
const meta = {
  title: 'UI/OutlinedInput',
  component: OutlinedInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '아웃라인(테두리) 필드. **Figma:** `301:5601` (List_S)',
          '',
          '흰 배경 + 테두리 · 48px · radius-8. 포커스 시 테두리 진해짐(→ gray-600). 값 `gray-900` / placeholder `gray-500`.',
          '',
          '- **입력 모드** (`onChange`): 텍스트 입력 + 값 있으면 지우기(✕) — 예: 가게 이름',
          '- **트리거 모드** (`onChange` 없이 `onClick`): 버튼, 탭 시 이동 — 예: 가게 위치 → 주소 검색',
        ].join('\n'),
      },
    },
  },
  args: { value: '', placeholder: '가게 이름을 입력해주세요' },
} satisfies Meta<typeof OutlinedInput>

export default meta
type Story = StoryObj<typeof meta>

function ControlledInput({
  initial = '',
  ...props
}: { initial?: string } & React.ComponentProps<typeof OutlinedInput>) {
  const [value, setValue] = useState(initial)
  return <OutlinedInput {...props} value={value} onChange={setValue} />
}

/** 입력 모드 · 빈 값 — placeholder(gray-500). */
export const Empty: Story = {
  name: '입력 · 빈 값',
  render: (args) => <ControlledInput {...args} />,
}

/** 입력 모드 · 값 입력 — 포커스하면 테두리 진해지고 ✕ 노출. */
export const Filled: Story = {
  name: '입력 · 값',
  render: (args) => <ControlledInput {...args} initial="뽀짜이 베트남쌀국수 명동본점" />,
}

/** 입력 모드 · 포커스 → 지우기(✕) → 비워짐. */
export const ClearInteraction: Story = {
  name: '입력 · 지우기',
  render: (args) => <ControlledInput {...args} initial="뽀짜이 베트남쌀국수 명동본점" />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox')
    await userEvent.click(input)
    const clear = canvas.getByRole('button', { name: '지우기' })
    await expect(clear).toBeInTheDocument()
    await userEvent.click(clear)
    await expect(input).toHaveValue('')
  },
}

/** 트리거 모드 · 빈 값 — 탭하면 onClick(예: 주소 검색 이동). 버튼으로 렌더. */
export const Trigger: Story = {
  name: '트리거 · 가게 위치',
  args: { placeholder: '가게 위치를 선택해주세요', onClick: () => {} },
}

/** 트리거 완료 · 주소 선택됨 — 2줄(도로명 + 지번). */
export const TriggerCompleted: Story = {
  name: '트리거 · 완료(2줄)',
  args: {
    value: '서울 중구 명동10길 52',
    subValue: '서울 중구 충무로2가 65-4',
    onClick: () => {},
  },
}
