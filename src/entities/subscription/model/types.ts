/** 구독 플랜 — 1년 단일 상품 (월간 플랜 폐지) */
export type SubscriptionPlan = 'ANNUAL'

export interface SubscriptionResponse {
  /** 구독 후 리포트 PRO 여부 (GET /users/me 의 isReportPro 와 동일 의미) */
  isReportPro: boolean
  plan: SubscriptionPlan
}
