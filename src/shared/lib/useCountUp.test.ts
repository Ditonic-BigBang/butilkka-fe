import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from './useCountUp'

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

describe('useCountUp', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('0에서 시작해 rAF 진행에 따라 목표값에 도달한다', () => {
    mockMatchMedia(false)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] })

    const { result } = renderHook(() => useCountUp(100, 300))
    expect(result.current).toBe(0)

    act(() => {
      vi.advanceTimersToNextFrame()
    })
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)

    // 300ms 를 충분히 지나도록 프레임 진행 → 목표값 안착
    act(() => {
      for (let i = 0; i < 30; i++) vi.advanceTimersToNextFrame()
    })
    expect(result.current).toBe(100)
  })

  it('prefers-reduced-motion 이면 즉시 목표값', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useCountUp(42))
    expect(result.current).toBe(42)
  })

  it('목표값이 바뀌면 현재 값에서 이어서 진행한다', () => {
    mockMatchMedia(false)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] })

    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 300), {
      initialProps: { target: 100 },
    })
    act(() => {
      for (let i = 0; i < 30; i++) vi.advanceTimersToNextFrame()
    })
    expect(result.current).toBe(100)

    rerender({ target: 50 })
    act(() => {
      vi.advanceTimersToNextFrame()
    })
    // 100 → 50 으로 하강 중 (0으로 리셋되지 않음)
    expect(result.current).toBeLessThan(100)
    expect(result.current).toBeGreaterThan(50)

    act(() => {
      for (let i = 0; i < 30; i++) vi.advanceTimersToNextFrame()
    })
    expect(result.current).toBe(50)
  })
})
