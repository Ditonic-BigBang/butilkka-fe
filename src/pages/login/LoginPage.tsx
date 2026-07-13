import { Navigate, useSearchParams } from 'react-router-dom'
import { MobileLayout } from '@/widgets/mobile-layout'
import { Logo } from '@/shared/ui'
import { isKakaoAuthConfigured, redirectToKakaoLogin } from '@/features/auth'
import { useIsAuthenticated } from '@/entities/session'

// 카카오 심볼(말풍선) — Figma 카카오 로고 653:20357 원본 path. 심볼은 순수 검정.
function KakaoSymbol() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="size-[18px]" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.00002 0.599609C4.02917 0.599609 0 3.71257 0 7.55189C0 9.93963 1.5584 12.0446 3.93152 13.2966L2.93303 16.9441C2.84481 17.2664 3.21341 17.5233 3.49646 17.3365L7.87334 14.4478C8.2427 14.4835 8.61808 14.5043 9.00002 14.5043C13.9705 14.5043 17.9999 11.3914 17.9999 7.55189C17.9999 3.71257 13.9705 0.599609 9.00002 0.599609"
      />
    </svg>
  )
}

/**
 * 로그인/스플래시 (Figma: ver.3 653:20355).
 * 로고 + 태그라인(화면 중앙 살짝 위) + 하단 카카오 로그인 버튼.
 * 실제 로그인은 백엔드 리다이렉트(features/auth) → /auth/kakao 콜백으로 이어진다.
 */
export default function LoginPage() {
  const isAuthenticated = useIsAuthenticated()
  const configured = isKakaoAuthConfigured()
  const [params] = useSearchParams()
  const error = params.get('error')

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <MobileLayout showBottomTab={false}>
      {/* 하단 여백: 홈 인디케이터(safe-area) + 56px (Figma: 버튼 y=706, 화면 852) */}
      <div className="relative flex min-h-full flex-col justify-end px-5 pb-[calc(var(--spacing-safe-bottom)+56px)]">
        {/* 로고 + 태그라인 — 블록 중심이 화면 중앙보다 26px 위 (Figma: 로고 중심 50%-80px) */}
        <div className="absolute inset-x-0 top-[calc(50%-26px)] flex -translate-y-1/2 flex-col items-center gap-10 px-5">
          <Logo variant="solid" className="h-[114px]" />
          <p className="text-center text-title-m-semibold text-gray-900">
            불안한 상권,
            <br />
            데이터로 대비하세요
          </p>
        </div>

        {/* 하단 카카오 로그인 */}
        <div className="flex flex-col items-center gap-3">
          {!configured && (
            <p className="text-body-m-regular text-status-red">
              .env 에 VITE_API_BASE_URL 을 설정해주세요.
            </p>
          )}
          {configured && error && (
            <p className="text-body-m-regular text-status-red">
              로그인에 실패했어요. 다시 시도해주세요.
            </p>
          )}
          <button
            type="button"
            onClick={redirectToKakaoLogin}
            disabled={!configured}
            className="flex h-14 w-full items-center justify-center gap-3.5 rounded-8 bg-kakao-yellow text-body-l-semibold text-black/85 transition-[filter] active:brightness-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <KakaoSymbol />
            카카오 로그인
          </button>
        </div>
      </div>
    </MobileLayout>
  )
}
