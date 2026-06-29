/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL (.env.local 에 설정) */
  readonly VITE_API_BASE_URL?: string
  /** 개발 중 MSW 브라우저 mock 활성화 여부 — 'true' 일 때만 시작 */
  readonly VITE_ENABLE_MSW?: string
  /** 카카오 JavaScript 키 — 지도 SDK + 로그인 SDK 공용 */
  readonly VITE_KAKAO_JS_KEY?: string
  /** 카카오 REST API 키 — 로그인 인가코드용(노출 주의) */
  readonly VITE_KAKAO_REST_KEY?: string
  /** 카카오 로그인 리다이렉트 URI */
  readonly VITE_KAKAO_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
