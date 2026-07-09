import { useEffect } from 'react'

/**
 * iOS PWA(standalone)에서 100dvh/vh 가 첫 렌더에 부정확하게 잡히는 문제 회피.
 * `window.innerHeight`(실제 뷰포트 높이)를 CSS 변수 `--app-height` 에 넣고,
 * resize·orientationchange·visualViewport 변화에 갱신한다.
 * 소비처(MobileLayout 등)는 `h-[var(--app-height,100dvh)]` 로 쓴다 — JS 로드 전에는 100dvh 폴백.
 */
export function useAppHeight() {
  useEffect(() => {
    const set = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    set()
    // 첫 페인트 후 한 번 더 — standalone 전체화면(black-translucent) 확장이 끝난 높이를 반영
    const raf = requestAnimationFrame(set)

    window.addEventListener('resize', set)
    window.addEventListener('orientationchange', set)
    window.visualViewport?.addEventListener('resize', set)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', set)
      window.removeEventListener('orientationchange', set)
      window.visualViewport?.removeEventListener('resize', set)
    }
  }, [])
}
