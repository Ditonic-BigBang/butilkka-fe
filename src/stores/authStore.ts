import { create } from 'zustand'
import { getCurrentUser, logoutSession, type AuthUser } from '@/lib/api'

type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'anonymous'

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  setUser: (user: AuthUser | null) => void
  restoreSession: () => Promise<AuthUser | null>
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
  logout: async () => {
    try {
      await logoutSession()
    } finally {
      set({ user: null, status: 'anonymous' })
    }
  },
}))

export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated')
