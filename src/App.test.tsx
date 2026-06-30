import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('제목을 렌더링한다', async () => {
    render(<App />)
    // 세션 확인(SessionGate 스플래시) 후 홈이 렌더되므로 비동기로 대기한다.
    expect(await screen.findByRole('heading', { name: '버틸까?' })).toBeInTheDocument()
  })
})
