import { create } from 'zustand'
import { getCurrentUser, logoutSession, type AuthUser } from '@/shared/api/api'

type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'anonymous'

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  setUser: (user: AuthUser | null) => void
  restoreSession: () => Promise<AuthUser | null>
  refreshUser: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

// 인증 상태 — 토큰은 JS 저장소에 두지 않고, 서버의 HttpOnly 쿠키 세션을 /me 로 확인한다.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'idle',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'anonymous' }),
  restoreSession: async () => {
    set({ status: 'checking' })

    try {
      const user = await getCurrentUser()
      set({ user, status: user ? 'authenticated' : 'anonymous' })
      return user
    } catch (error) {
      set({ user: null, status: 'anonymous' })
      throw error
    }
  },
  // 로그인된 상태에서 서버의 최신 user 를 조용히 재조회한다(온보딩 완료 후 store 반영 등).
  // restoreSession 과 달리 status 를 'checking' 으로 바꾸지 않아 SessionGate 스플래시가 안 뜬다.
  // 실패(네트워크·만료)해도 현재 세션을 흔들지 않는다 — 최신화 실패일 뿐이므로 조용히 넘어간다.
  refreshUser: async () => {
    try {
      const user = await getCurrentUser()
      if (user) set({ user, status: 'authenticated' })
      return user
    } catch {
      return null
    }
  },
  logout: async () => {
    try {
      await logoutSession()
    } finally {
      set({ user: null, status: 'anonymous' })
    }
  },
}))

export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated')
