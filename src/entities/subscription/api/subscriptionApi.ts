import { apiJson } from '@/shared/api/api'
import type { SubscriptionPlan, SubscriptionResponse } from '../model/types'

/**
 * POST /api/v1/users/me/subscription — 구독 확정 (실서버 스웨거 반영 확인: 2026-07-14).
 * 요청 {plan}·응답 {isReportPro, plan} 일치. 단 스웨거의 plan 은 enum 없는 string —
 * 'ANNUAL'/'MONTHLY' 값 표기는 백엔드와 재확인 필요.
 */
export function subscribe(plan: SubscriptionPlan): Promise<SubscriptionResponse> {
  return apiJson<SubscriptionResponse>('/api/v1/users/me/subscription', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}
