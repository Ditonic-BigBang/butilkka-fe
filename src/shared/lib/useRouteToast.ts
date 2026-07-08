import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * 라우트 state.toast 로 전달된 메시지를 하단 토스트로 표시하는 훅.
 * 다른 화면에서 `navigate(path, { state: { toast: '...' } })` 로 띄운다.
 * - 표시 직후 state 를 소비(replace)해 뒤로가기·새로고침 시 재표시를 막는다.
 * - 2.5초 노출 후 퇴장 애니(0.25초)를 거쳐 제거한다(타이머 기반 → reduced-motion 도 정상).
 * `{ toast, closing }` 을 반환 — 렌더는 `ToastHost` 가 담당.
 */
export function useRouteToast() {
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const message = (location.state as { toast?: string } | null)?.toast
    if (!message) return
    setToast(message)
    setClosing(false)
    navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  // 2.5초 노출 후 퇴장 애니 시작
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

  return { toast, closing }
}
