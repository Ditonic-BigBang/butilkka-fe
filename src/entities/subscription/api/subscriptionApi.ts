import { apiJson } from '@/shared/api/api'
import type { SubscriptionPlan, SubscriptionResponse } from '../model/types'

/** POST /api/v1/users/me/subscription — 구독 확정 (명세 미반영 선규격, 백엔드 전달 예정) */
export function subscribe(plan: SubscriptionPlan): Promise<SubscriptionResponse> {
  return apiJson<SubscriptionResponse>('/api/v1/users/me/subscription', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}
