import { useLayoutEffect } from 'react'
import { isIOS, isStandalone } from './platform'

// iOS standalone 은 시작 직후 뷰포트 높이가 수백 ms 늦게 확정되면서 resize 를 안 쏘기도 한다
// → 첫 2.5초 동안 몇 번 재측정해 따라잡는다 (하단 탭이 위로 떠 보이는 문제의 원인).
const SETTLE_DELAYS_MS = [50, 150, 300, 600, 1000, 1600, 2500]
const MAX_STABLE_STANDALONE_GAP = 220
const VIEWPORT_SHIFT_THRESHOLD = 1

type AppViewportMetrics = {
  innerHeight: number
  clientHeight: number
  visualHeight: number
  visualOffsetTop: number
  screenWidth: number
  screenHeight: number
  isIOSDevice: boolean
  isStandaloneMode: boolean
}

export function resolveAppViewportHeight({
  innerHeight,
  clientHeight,
  visualHeight,
  visualOffsetTop,
  screenWidth,
  screenHeight,
  isIOSDevice,
  isStandaloneMode,
}: AppViewportMetrics) {
  const layoutViewportHeight = Math.max(innerHeight, clientHeight, visualHeight)
  if (!isIOSDevice || visualHeight <= 0) return layoutViewportHeight
  if (!isStandaloneMode) return visualHeight

  const isPortrait = screenHeight >= screenWidth
  const isPhoneWidth = screenWidth <= 480
  const screenGap = screenHeight - visualHeight
  const viewportShifted = visualOffsetTop > VIEWPORT_SHIFT_THRESHOLD
  const stableStandaloneViewport =
    isPortrait &&
    isPhoneWidth &&
    !viewportShifted &&
    screenGap > 0 &&
    screenGap <= MAX_STABLE_STANDALONE_GAP

  // iOS 홈 화면 PWA는 키보드가 없어도 visualViewport.height를 전체 화면보다 작게 보고할 수 있다.
  // 정상 상태에서는 screen.height를 유지하고, 키보드로 크게 줄었거나 viewport가 위로 이동한
  // 경우에만 visualViewport를 사용해 CTA·토스트가 보이는 영역 안에 남게 한다.
  if (stableStandaloneViewport) return screenHeight

  return visualHeight
}

/**
 * 주소창·홈 인디케이터 등 iOS 시스템 UI를 제외하고 현재 실제로 보이는 높이.
 * 내비바가 없는 화면의 CTA·토스트가 layout viewport 아래로 밀리지 않게 사용한다.
 */
export function resolveVisibleViewportHeight({
  innerHeight,
  clientHeight,
  visualHeight,
}: Pick<AppViewportMetrics, 'innerHeight' | 'clientHeight' | 'visualHeight'>) {
  return visualHeight > 0 ? visualHeight : Math.max(innerHeight, clientHeight)
}

export function getAppViewportHeight() {
  const screenHeight = Math.max(window.screen.height, window.screen.availHeight || 0)

  return resolveAppViewportHeight({
    innerHeight: window.innerHeight,
    clientHeight: document.documentElement.clientHeight,
    visualHeight: window.visualViewport?.height ?? 0,
    visualOffsetTop: window.visualViewport?.offsetTop ?? 0,
    screenWidth: window.screen.width,
    screenHeight,
    isIOSDevice: isIOS(),
    isStandaloneMode: isStandalone(),
  })
}

export function getVisibleViewportHeight() {
  return resolveVisibleViewportHeight({
    innerHeight: window.innerHeight,
    clientHeight: document.documentElement.clientHeight,
    visualHeight: window.visualViewport?.height ?? 0,
  })
}

function getAppViewportOffsetTop() {
  if (!isIOS()) return 0
  return Math.max(0, window.visualViewport?.offsetTop ?? 0)
}

/**
 * iOS PWA(standalone)에서 100dvh/vh 가 첫 렌더에 부정확하게 잡히는 문제 회피.
 * 실제 뷰포트 높이를 CSS 변수 `--app-height` 에 넣고 갱신한다.
 * - iOS 홈 화면 PWA의 정상 상태는 screen height를 유지해 하단 탭이 뜨지 않게 한다.
 * - 키보드로 크게 줄거나 offsetTop이 생긴 상태만 visualViewport를 사용한다.
 * - 시작 직후 2.5초간 재측정 + resize·orientationchange·visualViewport·pageshow 에 갱신.
 * 소비처(MobileLayout 등)는 `h-[var(--app-height,100dvh)]` 로 쓴다 — JS 로드 전에는 100dvh 폴백.
 */
export function useAppHeight() {
  useLayoutEffect(() => {
    const set = () => {
      const height = getAppViewportHeight()
      const visibleHeight = getVisibleViewportHeight()
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`)
      document.documentElement.style.setProperty(
        '--app-visible-height',
        `${Math.round(visibleHeight)}px`,
      )
      document.documentElement.style.setProperty(
        '--app-offset-top',
        `${Math.round(getAppViewportOffsetTop())}px`,
      )
    }
    // 이벤트(특히 visualViewport scroll)는 프레임마다 연발된다 — rAF 로 프레임당 1회로 병합.
    // 초기 측정과 settle 타이머는 그대로 동기 set 을 쓴다 (첫 페인트 높이 확정이 우선).
    let frame: number | null = null
    const scheduleSet = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        set()
      })
    }

    set()
    // 첫 페인트 후 한 번 더 — standalone 전체화면(black-translucent) 확장이 끝난 높이를 반영
    const raf = requestAnimationFrame(set)
    const timers = SETTLE_DELAYS_MS.map((ms) => window.setTimeout(set, ms))

    window.addEventListener('resize', scheduleSet)
    window.addEventListener('orientationchange', scheduleSet)
    // bfcache 복귀·앱 전환 복귀 시 재측정
    window.addEventListener('pageshow', scheduleSet)
    document.addEventListener('visibilitychange', scheduleSet)
    window.visualViewport?.addEventListener('resize', scheduleSet)
    window.visualViewport?.addEventListener('scroll', scheduleSet)
    return () => {
      cancelAnimationFrame(raf)
      if (frame !== null) cancelAnimationFrame(frame)
      for (const timer of timers) clearTimeout(timer)
      window.removeEventListener('resize', scheduleSet)
      window.removeEventListener('orientationchange', scheduleSet)
      window.removeEventListener('pageshow', scheduleSet)
      document.removeEventListener('visibilitychange', scheduleSet)
      window.visualViewport?.removeEventListener('resize', scheduleSet)
      window.visualViewport?.removeEventListener('scroll', scheduleSet)
    }
  }, [])
}
