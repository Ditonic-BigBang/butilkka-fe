import { describe, expect, it } from 'vitest'
import { resolveAppViewportHeight } from './useAppHeight'

const baseMetrics = {
  innerHeight: 844,
  clientHeight: 844,
  visualHeight: 844,
  screenWidth: 390,
  screenHeight: 844,
  isIOSDevice: true,
  isStandaloneMode: true,
  allowInitialScreenFallback: false,
}

describe('resolveAppViewportHeight', () => {
  it('iOS에서는 키보드 전환 뒤 실제로 보이는 visual viewport 높이를 사용한다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        innerHeight: 844,
        clientHeight: 844,
        visualHeight: 760,
      }),
    ).toBe(760)
  })

  it('첫 실행 보정 중에는 기존 screen height fallback을 유지한다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        innerHeight: 780,
        clientHeight: 780,
        visualHeight: 780,
        allowInitialScreenFallback: true,
      }),
    ).toBe(844)
  })

  it('실제 viewport 이벤트 후에는 screen height로 앱을 과도하게 늘리지 않는다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        innerHeight: 780,
        clientHeight: 780,
        visualHeight: 780,
      }),
    ).toBe(780)
  })

  it('iOS가 아닌 환경은 기존처럼 보고된 높이 중 큰 값을 사용한다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        innerHeight: 800,
        clientHeight: 810,
        visualHeight: 760,
        isIOSDevice: false,
        isStandaloneMode: false,
      }),
    ).toBe(810)
  })
})
