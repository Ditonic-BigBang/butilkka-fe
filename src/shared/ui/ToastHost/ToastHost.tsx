import { useRouteToast } from '@/shared/lib/useRouteToast'
import { Toast } from '../Toast/Toast'

/**
 * 라우트 이동 시 전달된 토스트(`navigate(path, { state: { toast } })`)를
 * 화면 하단 가운데(프레임 폭 기준)에 표시한다. 페이지 안에 한 번만 배치하면 된다.
 * 등장·퇴장 애니 + 2.5초 자동 닫힘 (Figma: Toast 373:10078).
 */
export function ToastHost() {
  const { toast, closing } = useRouteToast()
  if (!toast) return null
  return (
    <div
      className={`${closing ? 'animate-toast-out' : 'animate-toast-in'} pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-[430px] justify-center px-5`}
    >
      <Toast>{toast}</Toast>
    </div>
  )
}
