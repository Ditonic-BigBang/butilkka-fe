import { describe, expect, it } from 'vitest'
import { resolveAppViewportHeight, resolveVisibleViewportHeight } from './useAppHeight'

const baseMetrics = {
  innerHeight: 844,
  clientHeight: 844,
  visualHeight: 844,
  visualOffsetTop: 0,
  screenWidth: 390,
  screenHeight: 844,
  isIOSDevice: true,
  isStandaloneMode: true,
}

describe('resolveAppViewportHeight', () => {
  it('iOS 홈 화면 PWA의 정상 상태에서는 screen 높이를 유지해 하단 탭이 뜨지 않는다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        visualHeight: 760,
      }),
    ).toBe(844)
  })

  it('키보드로 viewport가 크게 줄면 실제 visual viewport 높이를 사용한다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        visualHeight: 500,
      }),
    ).toBe(500)
  })

  it('키보드 복귀 후 viewport가 이동해 있으면 높이와 offset을 함께 보정할 수 있게 한다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        visualHeight: 780,
        visualOffsetTop: 64,
      }),
    ).toBe(780)
  })

  it('iOS 일반 Safari는 홈 화면용 screen fallback을 사용하지 않는다', () => {
    expect(
      resolveAppViewportHeight({
        ...baseMetrics,
        visualHeight: 760,
        isStandaloneMode: false,
      }),
    ).toBe(760)
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

describe('resolveVisibleViewportHeight', () => {
  it('내비바 없는 화면은 iOS에서 실제 보이는 visual viewport 높이를 사용한다', () => {
    expect(
      resolveVisibleViewportHeight({
        innerHeight: 844,
        clientHeight: 844,
        visualHeight: 760,
      }),
    ).toBe(760)
  })

  it('visual viewport를 지원하지 않으면 layout viewport 높이로 대체한다', () => {
    expect(
      resolveVisibleViewportHeight({
        innerHeight: 800,
        clientHeight: 810,
        visualHeight: 0,
      }),
    ).toBe(810)
  })
})
