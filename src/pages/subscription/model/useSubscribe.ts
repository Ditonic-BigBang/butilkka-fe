import { useMutation } from '@tanstack/react-query'
import { apiJson } from '@/shared/api/api'
import { useAuthStore } from '@/entities/session'
import type { SubscriptionPlan, SubscriptionResponse } from '@/shared/api/types'

/** 화면의 플랜 선택값 → API plan (명세 미반영 선규격) */
const PLAN_CODES = { annual: 'ANNUAL', monthly: 'MONTHLY' } as const satisfies Record<
  string,
  SubscriptionPlan
>

export type PlanKey = keyof typeof PLAN_CODES

/** POST /api/v1/users/me/subscription — 구독 확정 (명세 미반영 선규격, 백엔드 전달 예정) */
function subscribe(plan: PlanKey): Promise<SubscriptionResponse> {
  return apiJson<SubscriptionResponse>('/api/v1/users/me/subscription', {
    method: 'POST',
    body: JSON.stringify({ plan: PLAN_CODES[plan] }),
  })
}

/**
 * 구독 확정 뮤테이션.
 * 성공하면 세션 user 를 재조회해 isReportPro 를 반영한다 —
 * 리포트 잠금 해제·마이페이지 "이용중" 카드가 별도 처리 없이 따라온다.
 */
export function useSubscribe() {
  const refreshUser = useAuthStore((s) => s.refreshUser)

  return useMutation({
    mutationFn: subscribe,
    onSuccess: () => {
      void refreshUser()
    },
  })
}
