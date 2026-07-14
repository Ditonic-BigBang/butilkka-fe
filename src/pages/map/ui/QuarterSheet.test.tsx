import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuarterSheet } from './QuarterSheet'

describe('QuarterSheet', () => {
  it('최신 분기 기준 최근 3년 연도·분기 칩을 렌더링하고, 적용값이 없으면 최신 분기가 선택돼 있다', () => {
    render(
      <QuarterSheet
        open
        onClose={() => {}}
        latestQuarter="2026Q1"
        value={null}
        onApply={() => {}}
      />,
    )

    expect(screen.getByText('조회할 분기 선택')).toBeInTheDocument()
    expect(screen.getByText('2026년')).toBeInTheDocument()
    expect(screen.getByText('2023년')).toBeInTheDocument()
    // 2026년엔 1분기 하나뿐이고 기본 선택 상태
    const latestChip = screen.getAllByRole('button', { name: '1분기', pressed: true })
    expect(latestChip).toHaveLength(1)
  })

  it('분기를 고르고 적용하면 onApply·onClose 가 호출된다', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(
      <QuarterSheet open onClose={onClose} latestQuarter="2026Q1" value={null} onApply={onApply} />,
    )

    // 2025년 행의 3분기 선택 (3분기는 2025·2024·2023 세 곳 — 첫 번째가 2025)
    await user.click(screen.getAllByRole('button', { name: '3분기' })[0])
    await user.click(screen.getByRole('button', { name: '적용' }))

    expect(onApply).toHaveBeenCalledWith('2025Q3')
    expect(onClose).toHaveBeenCalled()
  })

  it('닫혀 있으면 렌더링하지 않는다', () => {
    render(
      <QuarterSheet
        open={false}
        onClose={() => {}}
        latestQuarter="2026Q1"
        value={null}
        onApply={() => {}}
      />,
    )
    expect(screen.queryByText('조회할 분기 선택')).not.toBeInTheDocument()
  })
})
