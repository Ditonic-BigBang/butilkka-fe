import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomTab } from './BottomTab'

describe('BottomTab', () => {
  it('모든 탭 항목을 렌더링한다', () => {
    render(<BottomTab />)
    expect(screen.getByRole('button', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '마이' })).toBeInTheDocument()
  })

  it('비제어 모드: 기본값(첫 탭)이 활성이고, 클릭하면 활성 탭이 바뀐다', async () => {
    const user = userEvent.setup()
    render(<BottomTab />)
    expect(screen.getByRole('button', { name: '홈' })).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('button', { name: '상권지도' }))
    expect(screen.getByRole('button', { name: '상권지도' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '홈' })).not.toHaveAttribute('aria-current')
  })

  it('제어 모드: activeTab 을 반영하고 클릭 시 onTabChange 를 호출한다', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<BottomTab activeTab="report" onTabChange={onTabChange} />)

    expect(screen.getByRole('button', { name: '리포트' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: '상권지도' }))
    expect(onTabChange).toHaveBeenCalledWith('map')
  })
})
