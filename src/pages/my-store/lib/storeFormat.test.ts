import { describe, it, expect } from 'vitest'
import { formatFounded } from './storeFormat'

describe('formatFounded', () => {
  it('YYYY-MM-DD 를 "YYYY년 M월 D일 창업" 으로 변환한다', () => {
    expect(formatFounded('2022-08-12')).toBe('2022년 8월 12일 창업')
    expect(formatFounded('2025-12-01')).toBe('2025년 12월 1일 창업')
  })

  it('값이 없거나 형식이 어긋나면 빈 문자열을 돌려준다', () => {
    expect(formatFounded(undefined)).toBe('')
    expect(formatFounded('')).toBe('')
    expect(formatFounded('창업일')).toBe('')
    expect(formatFounded('2022-13-01')).toBe('') // 월 오류
    expect(formatFounded('2022-08-32')).toBe('') // 일 오류
    expect(formatFounded('2022-08')).toBe('') // 일 누락
  })
})
