import { QueryClient } from '@tanstack/react-query'

// 앱 전역에서 공유하는 단일 QueryClient.
// 기본값은 모바일 환경 기준으로 보수적으로 설정 — 필요 시 쿼리별로 덮어쓰기.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분간 fresh로 간주 → 불필요한 재요청 방지
      gcTime: 5 * 60 * 1000, // 미사용 캐시 5분 후 정리
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
