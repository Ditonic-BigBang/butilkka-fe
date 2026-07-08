const API_BASE = import.meta.env.VITE_API_BASE_URL

function getApiUrl(path: string): string {
  if (!API_BASE) return path
  return new URL(path, API_BASE).toString()
}

function rawFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(getApiUrl(path), {
    ...init,
    credentials: 'include',
  })
}

// 동시에 여러 요청이 401 을 맞아도 refresh 는 한 번만 (진행 중 promise 공유)
let refreshPromise: Promise<boolean> | null = null

/** access_token 만료 시 refresh_token 쿠키로 재발급 (명세: POST /api/v1/auth/refresh) */
function tryRefresh(): Promise<boolean> {
  refreshPromise ??= rawFetch('/api/v1/auth/refresh', { method: 'POST' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

/**
 * 인증 포함 fetch — access_token(30분) 만료로 401/403 이면
 * refresh 후 원요청을 1회 재시도한다. auth 엔드포인트 자신은 제외(루프 방지).
 * (Spring Security 기본 설정이 미인증에 403 을 줄 수 있어 둘 다 처리)
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await rawFetch(path, init)

  const unauthorized = response.status === 401 || response.status === 403
  if (unauthorized && !path.startsWith('/api/v1/auth/')) {
    if (await tryRefresh()) return rawFetch(path, init)
  }
  return response
}

/** 백엔드 공통 응답 envelope (API명세서 V3: { code, status, message, data }) */
export interface ApiEnvelope<T> {
  code: number
  status: string
  message: string
  data: T
}

/**
 * envelope 응답 fetch + 언랩 — data 만 돌려주고,
 * HTTP 에러·code ≥ 400 이면 서버 message 로 throw (react-query 에서 error.message 로 노출).
 */
export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || body == null || body.code >= 400) {
    throw new Error(body?.message ?? `요청에 실패했습니다. (${response.status})`)
  }
  return body.data
}

/** GET /api/v1/users/me 응답 (UserResponse) */
export interface AuthUser {
  id: string | number
  name?: string
  isOnboarded?: boolean
  /** 리포트 PRO 구독 여부 (선규격 — 구독 API 미정). true면 이용중 카드, false/미정이면 업그레이드 카드 */
  isReportPro?: boolean
  /** 온보딩 완료 사용자의 가게 요약 (미완료면 null) */
  store?: {
    regionCode: string
    regionName: string
    categoryCode: string
    categoryName: string
    lat: number
    lng: number
    /** 가게명·주소·창업일 — 명세 "수정 필요"(store 응답 범위 논의중)라 마이페이지 표시용 선반영 */
    storeName?: string
    address?: string
    /** 창업일 (YYYY-MM-DD) */
    storeOpenDate?: string
  } | null
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await apiFetch('/api/v1/users/me')

  // 401/403 = 비로그인 (실서버는 미인증에 403 을 반환)
  if (response.status === 401 || response.status === 403) return null
  if (!response.ok) throw new Error('현재 사용자 정보를 불러오지 못했습니다.')

  const body = (await response.json()) as ApiEnvelope<AuthUser>
  return body.data
}

export async function logoutSession(): Promise<void> {
  const response = await apiFetch('/api/v1/auth/logout', { method: 'POST' })

  if (!response.ok && response.status !== 401) {
    throw new Error('로그아웃에 실패했습니다.')
  }
}
