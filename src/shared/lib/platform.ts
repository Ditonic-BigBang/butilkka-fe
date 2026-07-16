type NavigatorWithStandalone = Navigator & { standalone?: boolean }

/** iOS 여부 (iPadOS 데스크톱 UA 위장 포함 — MacIntel + 터치). */
export function isIOS() {
  return (
    /iP(ad|hone|od)/.test(window.navigator.userAgent) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  )
}

/**
 * 홈 화면 아이콘으로 실행된 PWA(standalone) 여부.
 * 표준 `display-mode: standalone` + iOS Safari 레거시 `navigator.standalone`.
 */
export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  )
}
