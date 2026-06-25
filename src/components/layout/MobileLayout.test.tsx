import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MobileLayout } from './MobileLayout'

describe('MobileLayout', () => {
  it('children 을 렌더링한다', () => {
    render(
      <MobileLayout>
        <p>본문 내용</p>
      </MobileLayout>,
    )
    expect(screen.getByText('본문 내용')).toBeInTheDocument()
  })

  it('기본적으로 하단 탭을 노출한다', () => {
    render(<MobileLayout>x</MobileLayout>)
    expect(screen.getByRole('navigation', { name: '메인 내비게이션' })).toBeInTheDocument()
  })

  it('showBottomTab=false 면 하단 탭을 숨긴다', () => {
    render(<MobileLayout showBottomTab={false}>x</MobileLayout>)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
