import { useEffect } from 'react'

// iOS standalone 은 시작 직후 뷰포트 높이가 수백 ms 늦게 확정되면서 resize 를 안 쏘기도 한다
// → 첫 1초 동안 몇 번 재측정해 따라잡는다 (하단 탭이 위로 떠 보이는 문제의 원인).
const SETTLE_DELAYS_MS = [150, 300, 600, 1000]

/**
 * iOS PWA(standalone)에서 100dvh/vh 가 첫 렌더에 부정확하게 잡히는 문제 회피.
 * 실제 뷰포트 높이를 CSS 변수 `--app-height` 에 넣고 갱신한다.
 * - 값은 `innerHeight` 와 `visualViewport.height` 중 큰 쪽 — 어느 한쪽이 늦게/작게
 *   보고되는 iOS 케이스를 방어하고, 키보드로 visualViewport 만 줄어들 땐 레이아웃을 안 누른다.
 * - 시작 직후 1초간 재측정 + resize·orientationchange·visualViewport·pageshow 에 갱신.
 * 소비처(MobileLayout 등)는 `h-[var(--app-height,100dvh)]` 로 쓴다 — JS 로드 전에는 100dvh 폴백.
 */
export function useAppHeight() {
  useEffect(() => {
    const set = () => {
      const height = Math.max(window.innerHeight, window.visualViewport?.height ?? 0)
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`)
    }
    set()
    // 첫 페인트 후 한 번 더 — standalone 전체화면(black-translucent) 확장이 끝난 높이를 반영
    const raf = requestAnimationFrame(set)
    const timers = SETTLE_DELAYS_MS.map((ms) => window.setTimeout(set, ms))

    window.addEventListener('resize', set)
    window.addEventListener('orientationchange', set)
    // bfcache 복귀·앱 전환 복귀 시 재측정
    window.addEventListener('pageshow', set)
    window.visualViewport?.addEventListener('resize', set)
    return () => {
      cancelAnimationFrame(raf)
      for (const timer of timers) clearTimeout(timer)
      window.removeEventListener('resize', set)
      window.removeEventListener('orientationchange', set)
      window.removeEventListener('pageshow', set)
      window.visualViewport?.removeEventListener('resize', set)
    }
  }, [])
}
