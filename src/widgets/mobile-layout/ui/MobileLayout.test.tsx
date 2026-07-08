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
})
