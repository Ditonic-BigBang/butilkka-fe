import { useLayoutEffect } from 'react'
import { isIOS, isStandalone } from './platform'

// iOS standalone 은 시작 직후 뷰포트 높이가 수백 ms 늦게 확정되면서 resize 를 안 쏘기도 한다
// → 첫 2.5초 동안 몇 번 재측정해 따라잡는다 (하단 탭이 위로 떠 보이는 문제의 원인).
const SETTLE_DELAYS_MS = [50, 150, 300, 600, 1000, 1600, 2500]

type AppViewportMetrics = {
  innerHeight: number
  clientHeight: number
  visualHeight: number
  screenWidth: number
  screenHeight: number
  isIOSDevice: boolean
  isStandaloneMode: boolean
  allowInitialScreenFallback: boolean
}

export function resolveAppViewportHeight({
  innerHeight,
  clientHeight,
  visualHeight,
  screenWidth,
  screenHeight,
  isIOSDevice,
  isStandaloneMode,
  allowInitialScreenFallback,
}: AppViewportMetrics) {
  // iOS 는 키보드·주소창 전환 뒤 layout viewport 값이 실제 보이는 영역보다 크게 남을 수 있다.
  // 이때에만 visualViewport 를 우선하고, 다른 플랫폼의 기존 높이 선택은 유지한다.
  const viewportHeight =
    isIOSDevice && visualHeight > 0
      ? visualHeight
      : Math.max(innerHeight, clientHeight, visualHeight)

  if (!allowInitialScreenFallback || !isIOSDevice || !isStandaloneMode) return viewportHeight

  const isPortrait = screenHeight >= screenWidth
  const isPhoneWidth = Math.min(screenWidth, innerHeight) <= 480
  const screenGap = screenHeight - viewportHeight

  // 첫 실행 직후에만 screen.height 를 임시 fallback 으로 쓴다. 실제 뷰포트 이벤트가
  // 한 번이라도 발생한 뒤에는 visualViewport 로 전환해 키보드 복귀 후 잘림을 막는다.
  if (isPortrait && isPhoneWidth && screenGap > 0 && screenGap <= 220) return screenHeight

  return viewportHeight
}

export function getAppViewportHeight(allowInitialScreenFallback = false) {
  const screenHeight = Math.max(window.screen.height, window.screen.availHeight || 0)

  return resolveAppViewportHeight({
    innerHeight: window.innerHeight,
    clientHeight: document.documentElement.clientHeight,
    visualHeight: window.visualViewport?.height ?? 0,
    screenWidth: window.screen.width,
    screenHeight,
    isIOSDevice: isIOS(),
    isStandaloneMode: isStandalone(),
    allowInitialScreenFallback,
  })
}

function getAppViewportOffsetTop() {
  if (!isIOS()) return 0
  return Math.max(0, window.visualViewport?.offsetTop ?? 0)
}

/**
 * iOS PWA(standalone)에서 100dvh/vh 가 첫 렌더에 부정확하게 잡히는 문제 회피.
 * 실제 뷰포트 높이를 CSS 변수 `--app-height` 에 넣고 갱신한다.
 * - iOS 는 실제 표시 영역인 `visualViewport.height` 를 우선한다.
 * - iOS 홈화면 PWA 첫 실행 중에만 screen height 를 임시 fallback 으로 쓴다.
 * - 시작 직후 2.5초간 재측정 + resize·orientationchange·visualViewport·pageshow 에 갱신.
 * 소비처(MobileLayout 등)는 `h-[var(--app-height,100dvh)]` 로 쓴다 — JS 로드 전에는 100dvh 폴백.
 */
export function useAppHeight() {
  useLayoutEffect(() => {
    let allowInitialScreenFallback = true

    const set = () => {
      const height = getAppViewportHeight(allowInitialScreenFallback)
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`)
      document.documentElement.style.setProperty(
        '--app-offset-top',
        `${Math.round(getAppViewportOffsetTop())}px`,
      )
    }
    // 이벤트(특히 visualViewport scroll)는 프레임마다 연발된다 — rAF 로 프레임당 1회로 병합.
    // 초기 측정과 settle 타이머는 그대로 동기 set 을 쓴다 (첫 페인트 높이 확정이 우선).
    let frame: number | null = null
    const scheduleSet = () => {
      // 실제 viewport 이벤트가 한 번이라도 오면 초기 screen fallback 역할은 끝난다.
      allowInitialScreenFallback = false
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
