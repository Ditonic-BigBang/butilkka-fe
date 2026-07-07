import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/entities/session'

// 카카오 로그인 콜백 랜딩 (API명세서 V3: /api/v1/auth/kakao/callback).
// 백엔드는 HttpOnly 쿠키(access 30분·refresh 7일)를 심은 뒤
// /auth/kakao?success=true&isOnboarded={bool} 로 리다이렉트한다.
// 프론트는 토큰을 직접 읽지 않고 /me 로 세션만 확인한다.
export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    const success = params.get('success') === 'true'
    const isOnboardedParam = params.get('isOnboarded') // 'true' | 'false' | null(미지원 백엔드)

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

        // 분기값은 명세대로 콜백 쿼리를 우선, 없으면 /me 응답으로 폴백.
        // 미온보딩(또는 값 없음)은 온보딩부터.
        const isOnboarded =
          isOnboardedParam != null ? isOnboardedParam === 'true' : (user.isOnboarded ?? false)
        navigate(isOnboarded ? '/' : '/onboarding', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=session', { replace: true })
      })
  }, [params, navigate, restoreSession])

  // Figma 288:5389 — 로그인 진행 안내
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <p className="text-body-m-regular text-gray-400">로그인 중입니다. 잠시만 기다려주세요.</p>
    </div>
  )
}
