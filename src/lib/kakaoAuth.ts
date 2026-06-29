// 카카오 OAuth(REST) 인가코드 플로우.
// 프론트는 "인가 요청"만 담당 — 사용자를 카카오 인가 페이지로 보낸다.
// 콜백(인가코드 → 토큰 교환)은 백엔드(:8080 /auth/kakao/callback)가 처리한다.
//
// CSRF 방지를 위한 state 검증은 백엔드 책임(콜백을 백엔드가 받으므로).

const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize'

const REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI

/** 로그인에 필요한 환경변수가 모두 설정돼 있는지 */
export function isKakaoAuthConfigured(): boolean {
  return Boolean(REST_KEY && REDIRECT_URI)
}

/** 카카오 인가 URL 생성 (response_type=code) */
export function buildKakaoAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: REST_KEY ?? '',
    redirect_uri: REDIRECT_URI ?? '',
    response_type: 'code',
  })
  return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`
}

/** 현재 탭을 카카오 로그인(인가) 페이지로 이동 */
export function redirectToKakaoLogin(): void {
  window.location.href = buildKakaoAuthorizeUrl()
}
