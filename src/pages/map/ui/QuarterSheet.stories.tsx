import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuarterSheet } from './QuarterSheet'

/** 조회 분기 선택 바텀시트. Figma: 기간 선택시 176:2131. */
const meta = {
  title: 'Map/QuarterSheet',
  component: QuarterSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '조회 분기 선택 바텀시트. **Figma:** `176:2131`',
          '',
          '- 최근 3년(12개 분기)을 연도별 `PeriodChip` 으로 나열, 기본 선택은 최신 분기',
          '- 시트 안은 draft — `적용`(CTA) 눌러야 반영, 백드롭 탭/핸들 드래그로 취소',
        ].join('\n'),
      },
    },
  },
  args: {
    open: true,
    onClose: () => {},
    latestQuarter: '2026Q1',
    value: null,
    onApply: () => {},
  },
} satisfies Meta<typeof QuarterSheet>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 최신 분기(2026 1분기) 선택 상태. */
export const Default: Story = { name: '기본' }

function InteractiveDemo() {
  const [open, setOpen] = useState(true)
  const [quarter, setQuarter] = useState<string | null>(null)
  return (
    <div className="flex h-dvh flex-col items-center gap-3 bg-gray-100 p-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-8 bg-key px-4 py-2 text-body-m-semibold text-white"
      >
        기간 선택 열기
      </button>
      <p className="text-body-m-medium text-gray-700">적용된 분기: {quarter ?? '최신(기본)'}</p>
      <QuarterSheet
        open={open}
        onClose={() => setOpen(false)}
        latestQuarter="2026Q1"
        value={quarter}
        onApply={setQuarter}
      />
    </div>
  )
}

/** 선택 → 적용 흐름 인터랙티브. */
export const Interactive: Story = {
  name: '인터랙티브',
  render: () => <InteractiveDemo />,
}
