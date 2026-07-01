const API_BASE = import.meta.env.VITE_API_BASE_URL

function getApiUrl(path: string): string {
  if (!API_BASE) return path
  return new URL(path, API_BASE).toString()
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(getApiUrl(path), {
    ...init,
    credentials: 'include',
  })
}

export interface AuthUser {
  id: string | number
  nickname?: string
  profileImageUrl?: string
  isOnboarded?: boolean
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await apiFetch('/api/v1/users/me')

  if (response.status === 401) return null
  if (!response.ok) throw new Error('현재 사용자 정보를 불러오지 못했습니다.')

  return response.json() as Promise<AuthUser>
}

export async function logoutSession(): Promise<void> {
  const response = await apiFetch('/api/v1/auth/logout', { method: 'POST' })

  if (!response.ok && response.status !== 401) {
    throw new Error('로그아웃에 실패했습니다.')
  }
}
