import { MobileLayout } from '@/components/layout'
import { isKakaoAuthConfigured, redirectToKakaoLogin } from '@/lib/kakaoAuth'

// 카카오 심볼(말풍선). 노란 버튼 위 검정 심볼.
function KakaoSymbol() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.937-28.04C115.752 200.566 121.81 201 128 201c57.438 0 104-36.712 104-83 0-46.287-46.562-82-104-82z" />
    </svg>
  )
}

export default function LoginPage() {
  const configured = isKakaoAuthConfigured()

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col items-center justify-center gap-10 px-6 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">버틸까?</h1>
          <p className="text-sm text-gray-500">카카오로 간편하게 시작하세요</p>
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <button
            type="button"
            onClick={redirectToKakaoLogin}
            disabled={!configured}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-3 font-medium text-[rgba(0,0,0,0.85)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <KakaoSymbol />
            카카오 로그인
          </button>

          {!configured && (
            <p className="text-center text-xs text-red-500">
              .env 에 VITE_API_BASE_URL 을 설정해주세요.
            </p>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
