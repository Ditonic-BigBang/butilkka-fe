import { describe, expect, it } from 'vitest'
import { formatDecimal, formatNumber } from './formatNumber'

describe('formatNumber', () => {
  it('천 단위 구분', () => {
    expect(formatNumber(12345)).toBe('12,345')
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatDecimal', () => {
  it('소수 둘째 자리까지, 뒤 0 없이', () => {
    expect(formatDecimal(9299.3131)).toBe('9,299.31')
    expect(formatDecimal(18)).toBe('18')
    expect(formatDecimal(0.5)).toBe('0.5')
  })
})
