import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/session'
import { subscribe } from '@/entities/subscription'

/**
 * 구독 확정 뮤테이션 — 플랜은 1년 단일(ANNUAL)이라 인자가 없다.
 * 성공하면 세션 user 를 재조회해 isReportPro 를 반영한다 —
 * 리포트·지도 잠금 해제와 마이페이지 "이용중" 카드가 별도 처리 없이 따라온다.
 */
export function useSubscribe() {
  const refreshUser = useAuthStore((s) => s.refreshUser)

  return useMutation({
    mutationFn: () => subscribe('ANNUAL'),
    onSuccess: () => {
      void refreshUser()
    },
  })
}
