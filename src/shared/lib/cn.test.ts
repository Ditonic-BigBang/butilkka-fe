import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('클래스를 합친다', () => {
    expect(cn('px-2', 'text-white')).toBe('px-2 text-white')
  })

  it('Tailwind 충돌은 뒤쪽 클래스가 이긴다', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('falsy 값은 무시한다', () => {
    expect(cn('px-2', false, null, undefined, 'text-white')).toBe('px-2 text-white')
  })
})
