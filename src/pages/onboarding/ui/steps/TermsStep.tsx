import { Checkbox } from '@/shared/ui'
import { useOnboardingStore, canProceed, type TermsAgreement } from '../../model/useOnboardingStore'
import { OnboardingStepLayout } from '../OnboardingStepLayout'

const TERM_ITEMS: { key: keyof TermsAgreement; label: string; detail?: boolean }[] = [
  { key: 'age', label: '[필수] 만 14세 이상입니다' },
  { key: 'service', label: '[필수] 서비스 이용약관 동의', detail: true },
  { key: 'privacy', label: '[필수] 개인정보 수집 및 이용 동의', detail: true },
  { key: 'optional', label: '[선택] 선택정보 수집 및 이용 동의', detail: true },
]

const FOOTNOTE =
  '선택 항목에 동의하지 않아도 서비스 이용이 가능합니다.\n개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며\n동의 거부 시 회원 서비스 이용이 제한됩니다.'

/**
 * 약관 동의 스텝 (Figma: 285:4600 미체크 · 288:4618 체크).
 * 전체 동의(26px) + 필수 3 / 선택 1 체크리스트 — 필수 모두 체크 시 CTA 활성.
 */
export function TermsStep() {
  const { terms, setTerms, next, draft } = useOnboardingStore()
  const allAgreed = TERM_ITEMS.every((item) => terms[item.key])

  const toggleAll = () =>
    setTerms({ age: !allAgreed, service: !allAgreed, privacy: !allAgreed, optional: !allAgreed })

  return (
    <OnboardingStepLayout
      title={'서비스 이용약관에\n동의해주세요'}
      showBack={false}
      ctaDisabled={!canProceed('terms', { draft, terms })}
      onCta={next}
    >
      <div className="flex flex-col gap-5">
        {/* 전체 동의 */}
        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={allAgreed}
            onCheckedChange={toggleAll}
            aria-label="전체 동의하기"
            className="size-[26px]"
          />
          <span className="text-title-s-semibold text-gray-900">전체 동의하기</span>
        </div>

        <hr className="border-gray-100" />

        {TERM_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-2.5">
            <Checkbox
              checked={terms[item.key]}
              onCheckedChange={(checked) => setTerms({ [item.key]: checked })}
              aria-label={item.label}
            />
            <span className="flex-1 text-body-l-medium text-gray-900">{item.label}</span>
            {item.detail && (
              <button
                type="button"
                className="shrink-0 rounded-4 bg-gray-70 px-1.5 py-1 text-caption-l-medium text-gray-700"
              >
                자세히
              </button>
            )}
          </div>
        ))}

        <hr className="border-gray-100" />

        <p className="text-caption-l-medium whitespace-pre-line text-gray-400">{FOOTNOTE}</p>
      </div>
    </OnboardingStepLayout>
  )
}
