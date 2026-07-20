import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { MobileLayout } from './MobileLayout'

// useActiveTab 이 라우터(useLocation/useNavigate)를 쓰므로 MemoryRouter 로 감싼다.
const renderWithRouter = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('MobileLayout', () => {
  it('children 을 렌더링한다', () => {
    renderWithRouter(
      <MobileLayout>
        <p>본문 내용</p>
      </MobileLayout>,
    )
    expect(screen.getByText('본문 내용')).toBeInTheDocument()
  })

  it('기본적으로 하단 탭을 노출한다', () => {
    renderWithRouter(<MobileLayout>x</MobileLayout>)
    expect(screen.getByRole('navigation', { name: '메인 내비게이션' })).toBeInTheDocument()
  })

  it('showBottomTab=false 면 하단 탭을 숨긴다', () => {
    renderWithRouter(<MobileLayout showBottomTab={false}>x</MobileLayout>)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('하단 탭 유무에 따라 전체 화면 높이와 실제 가시 높이를 분리한다', () => {
    const withTab = renderWithRouter(<MobileLayout>탭 있음</MobileLayout>)
    expect(withTab.container.firstElementChild).toHaveClass('h-[var(--app-height,100dvh)]')
    withTab.unmount()

    const withoutTab = renderWithRouter(<MobileLayout showBottomTab={false}>탭 없음</MobileLayout>)
    expect(withoutTab.container.firstElementChild).toHaveClass(
      'h-[var(--app-visible-height,var(--app-height,100dvh))]',
    )
  })

  it('스크롤 동작은 유지하면서 기본 스크롤바만 숨긴다', () => {
    renderWithRouter(<MobileLayout>x</MobileLayout>)

    expect(screen.getByRole('main')).toHaveClass(
      'scrollbar-hide',
      'overflow-y-auto',
      'overscroll-contain',
    )
  })

  it('scrollable=false 면 본문 스크롤과 오버스크롤을 막는다', () => {
    renderWithRouter(<MobileLayout scrollable={false}>x</MobileLayout>)

    expect(screen.getByRole('main')).toHaveClass('overflow-hidden', 'overscroll-none')
    expect(screen.getByRole('main')).not.toHaveClass('scrollbar-hide', 'overflow-y-auto')
  })
})
