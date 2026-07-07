/**
 * 온보딩 스텝 순서 (Figma: [1-2] 온보딩 플로우).
 * 약관 → 가게 주소 → 업종 → 가게 이름 → 창업일 → 완료.
 */
export const ONBOARDING_STEPS = [
  'terms',
  'address',
  'industry',
  'name',
  'founded',
  'complete',
] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]
