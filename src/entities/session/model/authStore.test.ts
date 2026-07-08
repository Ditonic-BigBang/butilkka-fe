import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/api/mocks/server'
import { useAuthStore } from './authStore'

const API = import.meta.env.VITE_API_BASE_URL ?? ''

function ok<T>(data: T) {
  return HttpResponse.json({ code: 200, status: 'OK', message: '', data })
}

const STORE = {
  regionCode: '3110001',
  regionName: '가로수길',
  categoryCode: 'CS100006',
  categoryName: '커피전문점',
  lat: 37.5,
  lng: 127,
  storeName: '내 가게',
  address: '서울 중구 명동10길 52',
}

describe('authStore.refreshUser', () => {
  beforeEach(() => useAuthStore.setState({ user: null, status: 'idle' }))

  it('서버의 최신 user(store 포함)를 반영한다', async () => {
    server.use(
      http.get(`${API}/api/v1/users/me`, () =>
        ok({ id: 1, name: '점주', isOnboarded: true, store: STORE }),
      ),
    )
    // 온보딩 완료 직후처럼 store 가 아직 없는 로그인 상태에서 갱신
    useAuthStore.setState({
      user: { id: 1, name: '점주', isOnboarded: true, store: null },
      status: 'authenticated',
    })

    const result = await useAuthStore.getState().refreshUser()

    expect(result?.store?.storeName).toBe('내 가게')
    expect(useAuthStore.getState().user?.store?.storeName).toBe('내 가게')
  })

  it('status 를 checking 으로 바꾸지 않는다(전역 세션 스플래시 방지)', async () => {
    server.use(
      http.get(`${API}/api/v1/users/me`, () =>
        ok({ id: 1, name: '점주', isOnboarded: true, store: STORE }),
      ),
    )
    useAuthStore.setState({
      user: { id: 1, name: '점주', isOnboarded: true, store: null },
      status: 'authenticated',
    })

    const seen: string[] = []
    const unsub = useAuthStore.subscribe((s) => seen.push(s.status))
    await useAuthStore.getState().refreshUser()
    unsub()

    expect(seen).not.toContain('checking')
    expect(useAuthStore.getState().status).toBe('authenticated')
  })

  it('갱신 실패(비로그인 응답)해도 현재 세션을 흔들지 않는다', async () => {
    server.use(http.get(`${API}/api/v1/users/me`, () => new HttpResponse(null, { status: 403 })))
    const current = { id: 1, name: '점주', isOnboarded: true, store: null }
    useAuthStore.setState({ user: current, status: 'authenticated' })

    const result = await useAuthStore.getState().refreshUser()

    // getCurrentUser 는 403 을 null 로 반환 → 세션은 그대로 유지
    expect(result).toBeNull()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user).toBe(current)
  })
})
