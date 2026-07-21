import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/session'
import { subscribe } from '@/entities/subscription'

/**
 * 구독 확정 뮤테이션 — 플랜은 1년 단일(ANNUAL)이라 인자가 없다.
 *
 * 성공 응답의 isReportPro 를 세션에 **즉시** 반영한다 — 리포트·지도 잠금 해제와
 * 마이페이지 "이용중" 카드가 별도 처리 없이 따라온다. 이어지는 refreshUser 는
 * 나머지 필드(구독 만료일 등)를 맞추는 동기화일 뿐이라, 느리거나 실패해도
 * 결제한 사용자가 잠금 화면에 남지 않는다.
 */
export function useSubscribe() {
  const setUser = useAuthStore((s) => s.setUser)
  const refreshUser = useAuthStore((s) => s.refreshUser)

  return useMutation({
    mutationFn: () => subscribe('ANNUAL'),
    onSuccess: ({ isReportPro }) => {
      const user = useAuthStore.getState().user
      if (user) setUser({ ...user, isReportPro })
      void refreshUser()
    },
  })
}
