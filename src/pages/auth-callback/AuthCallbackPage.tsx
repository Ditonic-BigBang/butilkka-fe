import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/entities/session'

// 카카오 로그인 콜백 랜딩.
// 백엔드는 HttpOnly 쿠키를 설정한 뒤 /auth/kakao?success=true 로 리다이렉트한다.
// 프론트는 토큰을 직접 읽지 않고 /me 로 세션만 확인한다.
export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    const success = params.get('success') === 'true'

    if (!success) {
      navigate('/login?error=auth', { replace: true })
      return
    }

    void restoreSession()
      .then((user) => {
        if (!user) {
          navigate('/login?error=session', { replace: true })
          return
        }

        // TODO(온보딩): 온보딩 화면 생기면 user.isOnboarded === false 일 때 /onboarding 으로 분기.
        navigate('/', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=session', { replace: true })
      })
  }, [params, navigate, restoreSession])

  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-gray-400">
      로그인 처리 중…
    </div>
  )
}
