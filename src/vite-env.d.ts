/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL (.env.local 에 설정) */
  readonly VITE_API_BASE_URL?: string
  /** 개발 중 MSW 브라우저 mock 활성화 여부 — 'true' 일 때만 시작 */
  readonly VITE_ENABLE_MSW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
