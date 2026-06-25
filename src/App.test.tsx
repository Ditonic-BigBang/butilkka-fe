import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('제목을 렌더링한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '버틸까?' })).toBeInTheDocument()
  })
})
