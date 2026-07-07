import { useQuery } from '@tanstack/react-query'
import { SelectButton } from '@/shared/ui'
import { FALLBACK_CATEGORIES, getCategories, storeKeys } from '@/entities/store'
import { useOnboardingStore, canProceed } from '../../model/useOnboardingStore'
import { OnboardingStepLayout } from '../OnboardingStepLayout'

/**
 * 업종 선택 스텝 (Figma: 300:5641 · 310:6228).
 * 업종은 서버 목록(GET /api/v1/categories) 기준 — 응답 전/실패 시 Figma 10종 폴백.
 * 2열 그리드에서 하나 선택 시 CTA 활성.
 */
export function IndustryStep() {
  const { draft, patchDraft, terms, next, back } = useOnboardingStore()
  const { data } = useQuery({
    queryKey: storeKeys.categories(),
    queryFn: getCategories,
    staleTime: Infinity, // 업종 목록은 세션 내 불변
  })
  const categories = data ?? FALLBACK_CATEGORIES

  return (
    <OnboardingStepLayout
      title={'본인의 가게 업종을\n선택해주세요'}
      subtitle="상권 분석에 필요한 정보에요."
      onBack={back}
      ctaDisabled={!canProceed('industry', { draft, terms })}
      onCta={next}
    >
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <SelectButton
            key={category.categoryCode}
            selected={draft.categoryCode === category.categoryCode}
            onClick={() => patchDraft({ categoryCode: category.categoryCode })}
            className="w-full"
          >
            {category.categoryName}
          </SelectButton>
        ))}
      </div>
    </OnboardingStepLayout>
  )
}
