import { create } from 'zustand'
import type { StoreDraft } from '@/entities/store'
import { ONBOARDING_STEPS, type OnboardingStep } from './steps'

/** 약관 동의 상태 — age·service·privacy 는 필수, optional 은 선택 */
export interface TermsAgreement {
  age: boolean
  service: boolean
  privacy: boolean
  optional: boolean
}

const INITIAL_TERMS: TermsAgreement = {
  age: false,
  service: false,
  privacy: false,
  optional: false,
}

interface OnboardingState {
  stepIndex: number
  draft: StoreDraft
  terms: TermsAgreement
  next: () => void
  back: () => void
  patchDraft: (patch: Partial<StoreDraft>) => void
  setTerms: (patch: Partial<TermsAgreement>) => void
  /** 완료(또는 이탈) 후 초기화 — 진행 중 이탈했다 돌아오면 입력을 유지하기 위해 자동 리셋은 안 함 */
  reset: () => void
}

// 온보딩 위저드 상태 — 단일 라우트(/onboarding) 안에서 스텝 전환 + 입력 수집.
export const useOnboardingStore = create<OnboardingState>()((set) => ({
  stepIndex: 0,
  draft: {},
  terms: INITIAL_TERMS,
  next: () => set((s) => ({ stepIndex: Math.min(s.stepIndex + 1, ONBOARDING_STEPS.length - 1) })),
  back: () => set((s) => ({ stepIndex: Math.max(s.stepIndex - 1, 0) })),
  patchDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setTerms: (patch) => set((s) => ({ terms: { ...s.terms, ...patch } })),
  reset: () => set({ stepIndex: 0, draft: {}, terms: INITIAL_TERMS }),
}))

export const useOnboardingStep = (): OnboardingStep =>
  useOnboardingStore((s) => ONBOARDING_STEPS[s.stepIndex])

/** 현재 스텝에서 CTA(다음)를 누를 수 있는지 */
export function canProceed(
  step: OnboardingStep,
  state: {
    draft: StoreDraft
    terms: TermsAgreement
  },
): boolean {
  switch (step) {
    case 'terms':
      return state.terms.age && state.terms.service && state.terms.privacy
    case 'address':
      return state.draft.location != null
    case 'industry':
      return state.draft.categoryCode != null
    case 'name':
      return (state.draft.name ?? '').trim().length > 0
    case 'founded':
      return state.draft.foundedDate != null
    case 'complete':
      return true
  }
}
