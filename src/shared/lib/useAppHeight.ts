import { useLayoutEffect } from 'react'
import { isIOS, isStandalone } from './platform'

// iOS standalone 은 시작 직후 뷰포트 높이가 수백 ms 늦게 확정되면서 resize 를 안 쏘기도 한다
// → 첫 2.5초 동안 몇 번 재측정해 따라잡는다 (하단 탭이 위로 떠 보이는 문제의 원인).
const SETTLE_DELAYS_MS = [50, 150, 300, 600, 1000, 1600, 2500]

export function getAppViewportHeight() {
  const viewportHeights = [
    window.innerHeight,
    document.documentElement.clientHeight,
    window.visualViewport?.height ?? 0,
  ]
  const viewportHeight = Math.max(...viewportHeights)

  if (!isIOS() || !isStandalone()) return viewportHeight

  const { width, height, availHeight } = window.screen
  const screenHeight = Math.max(height, availHeight || 0)
  const isPortrait = screenHeight >= width
  const isPhoneWidth = Math.min(window.innerWidth, window.innerHeight) <= 480
  const screenGap = screenHeight - viewportHeight

  // iOS 홈화면 PWA 첫 실행에서 innerHeight/visualViewport 가 브라우저 chrome 이 있는 값처럼
  // 작게 고정되는 경우가 있다. iPhone portrait standalone 에 한해 screen.height 를 floor 로 쓴다.
  if (isPortrait && isPhoneWidth && screenGap > 0 && screenGap <= 220) return screenHeight

  return viewportHeight
}

/**
 * iOS PWA(standalone)에서 100dvh/vh 가 첫 렌더에 부정확하게 잡히는 문제 회피.
 * 실제 뷰포트 높이를 CSS 변수 `--app-height` 에 넣고 갱신한다.
 * - 값은 `innerHeight`, `clientHeight`, `visualViewport.height` 중 큰 쪽.
 * - iOS 홈화면 PWA 에서 첫 값이 작게 고정되면 iPhone portrait standalone 에 한해 screen height 를 floor 로 쓴다.
 * - 시작 직후 2.5초간 재측정 + resize·orientationchange·visualViewport·pageshow 에 갱신.
 * 소비처(MobileLayout 등)는 `h-[var(--app-height,100dvh)]` 로 쓴다 — JS 로드 전에는 100dvh 폴백.
 */
export function useAppHeight() {
  useLayoutEffect(() => {
    const set = () => {
      const height = getAppViewportHeight()
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`)
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
    window.addEventListener('visibilitychange', scheduleSet)
    window.visualViewport?.addEventListener('resize', scheduleSet)
    window.visualViewport?.addEventListener('scroll', scheduleSet)
    return () => {
      cancelAnimationFrame(raf)
      if (frame !== null) cancelAnimationFrame(frame)
      for (const timer of timers) clearTimeout(timer)
      window.removeEventListener('resize', scheduleSet)
      window.removeEventListener('orientationchange', scheduleSet)
      window.removeEventListener('pageshow', scheduleSet)
      window.removeEventListener('visibilitychange', scheduleSet)
      window.visualViewport?.removeEventListener('resize', scheduleSet)
      window.visualViewport?.removeEventListener('scroll', scheduleSet)
    }
  }, [])
}
