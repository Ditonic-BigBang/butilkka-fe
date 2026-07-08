import { useEffect } from 'react'

/**
 * Android(Chrome) PWA 상태바 색을 화면 배경색과 맞춘다.
 * `<meta name="theme-color">`(vite-plugin-pwa 가 주입)를 마운트 동안 지정 색으로 바꾸고,
 * 언마운트 시 이전 값으로 복원한다. 기본 화면(흰색)은 이 훅 없이 manifest 기본값을 쓴다.
 * (iOS 노치는 status-bar-style + 프레임 배경색으로 처리 — 이 훅은 Android 상태바용)
 */
export function useThemeColor(color: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) return
    const previous = meta.content
    meta.content = color
    return () => {
      meta.content = previous
    }
  }, [color])
}
