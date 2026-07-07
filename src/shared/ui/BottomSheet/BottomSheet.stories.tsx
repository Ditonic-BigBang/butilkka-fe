import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { BottomSheet } from './BottomSheet'

const SAMPLE = ['서울 서대문구', '서울 광진구', '서울 노원구', '서울 용산구', '서울 강서구']

function SheetDemo({
  title,
  subtitle,
  defaultOpen = false,
}: {
  title?: string
  subtitle?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="flex h-dvh flex-col items-center bg-gray-100 p-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-8 bg-key px-4 py-2 text-body-m-semibold text-white"
      >
        바텀시트 열기
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title} subtitle={subtitle}>
        <div className="flex flex-col gap-2 p-5">
          {SAMPLE.map((name, i) => (
            <div key={name} className="flex items-center gap-3 py-2">
              <span className="flex size-7 items-center justify-center rounded-8 bg-orange-10 text-body-m-medium text-key">
                {i + 1}
              </span>
              <span className="text-body-l-medium text-gray-900">{name}</span>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}

/** 바텀시트 셸. Figma: Bottom Sheet 353:10218. */
const meta = {
  title: 'Shared/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '바텀시트 셸. **Figma:** `353:10218`',
          '',
          '- 하단 고정 · rounded-t-20 · shadow-upper · 최대 646px',
          '- 핸들 + 헤더(제목·부제) + 스크롤 콘텐츠 슬롯',
          '- 핸들을 아래로 끌거나 백드롭을 탭하면 닫힘',
        ].join('\n'),
      },
    },
  },
  // open·children 은 render(SheetDemo)에서 관리 — 타입 충족용 더미
  args: { title: '쇠퇴 등급', subtitle: '서울 전체', open: false, children: null },
} satisfies Meta<typeof BottomSheet>

export default meta
type Story = StoryObj<typeof meta>

/** 열린 상태. */
export const Open: Story = {
  name: '열림',
  render: (args) => <SheetDemo title={args.title} subtitle={args.subtitle} defaultOpen />,
}

/** 열기 → 백드롭 탭 → 닫힘. */
export const Interaction: Story = {
  name: '열기/닫기',
  render: (args) => <SheetDemo title={args.title} subtitle={args.subtitle} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '바텀시트 열기' }))
    await expect(canvas.getByRole('dialog', { name: '쇠퇴 등급' })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }))
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
  },
}
