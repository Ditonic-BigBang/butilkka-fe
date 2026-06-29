// 카카오 로그인 — 백엔드 주도(Authorization Code) 방식.
// 프론트는 백엔드의 "로그인 시작" 엔드포인트로 이동만 한다.
// 이후 백엔드가 state 생성 → 카카오 인가 페이지로 리다이렉트 → 콜백에서
// state 검증 + 토큰 교환까지 처리한다.
//
// 따라서 REST 키·redirect_uri·state 는 모두 백엔드 소유이며 프론트에 노출되지 않는다.

const API_BASE = import.meta.env.VITE_API_BASE_URL

// 백엔드 카카오 로그인 시작 경로 (백엔드 라우트와 일치해야 함).
const KAKAO_LOGIN_PATH = '/api/v1/auth/kakao/login'

/** 로그인에 필요한 설정(백엔드 베이스 URL)이 있는지 */
export function isKakaoAuthConfigured(): boolean {
  return Boolean(API_BASE)
}

/** 백엔드 카카오 로그인 시작 엔드포인트 URL */
export function getKakaoLoginUrl(): string {
  return `${API_BASE ?? ''}${KAKAO_LOGIN_PATH}`
}

/** 카카오 로그인 시작 — 백엔드 엔드포인트로 이동(백엔드가 카카오로 리다이렉트) */
export function redirectToKakaoLogin(): void {
  window.location.href = getKakaoLoginUrl()
}
