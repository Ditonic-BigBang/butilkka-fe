import { describe, expect, it } from 'vitest'
import { formatQuarter } from './quarter'

describe('formatQuarter', () => {
  it('"{year}Q{quarter}" 를 한국어 분기로 바꾼다', () => {
    expect(formatQuarter('2026Q2')).toBe('2026년 2분기')
    expect(formatQuarter('2025Q4')).toBe('2025년 4분기')
  })

  it('형식이 아니면 원문을 그대로 돌려준다', () => {
    expect(formatQuarter('2026-Q2')).toBe('2026-Q2')
    expect(formatQuarter('')).toBe('')
  })
})
