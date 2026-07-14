import { useEffect, useState } from 'react'

/**
 * 페이지 로컬 토스트 — `show(message)` 로 띄우면 2.5초 노출 후 퇴장 애니(0.25초)를 거쳐 사라진다.
 * 라우트 이동 없이 같은 화면에서 띄울 때 사용 (화면 이동과 함께면 useRouteToast + ToastHost).
 * 렌더 쪽: `<Toast className={closing ? 'animate-toast-out' : 'animate-toast-in'}>{toast}</Toast>`
 */
export function useTransientToast() {
  const [toast, setToast] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  const show = (message: string) => {
    setToast(message)
    setClosing(false)
  }

  // 2.5초 노출 후 퇴장 애니 시작 (useRouteToast 와 동일 타이밍 — reduced-motion 도 정상)
  useEffect(() => {
    if (!toast || closing) return
    const timer = setTimeout(() => setClosing(true), 2500)
    return () => clearTimeout(timer)
  }, [toast, closing])

  // 퇴장 애니(0.25초) 후 제거
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => {
      setToast(null)
      setClosing(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [closing])

  return { toast, closing, show }
}
