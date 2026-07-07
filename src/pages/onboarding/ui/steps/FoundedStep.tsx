import { DatePicker } from '@/shared/ui'
import { useOnboardingStore, canProceed } from '../../model/useOnboardingStore'
import { OnboardingStepLayout } from '../OnboardingStepLayout'

// draft 에는 'YYYY-MM-DD' 문자열로 보관 (서버 전송 형식), DatePicker 와는 Date 로 교환
function toDate(value?: string): Date | undefined {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 창업일 스텝 (Figma: 310:6878 · 310:6930).
 * 날짜 필드 클릭 → 캘린더 바텀시트(DatePicker) — 선택 시 CTA 활성.
 */
export function FoundedStep() {
  const { draft, patchDraft, terms, next, back } = useOnboardingStore()

  return (
    <OnboardingStepLayout
      title="가게 창업일을 입력해주세요"
      subtitle="정확하지 않아도 괜찮아요."
      onBack={back}
      ctaDisabled={!canProceed('founded', { draft, terms })}
      onCta={next}
    >
      <DatePicker
        value={toDate(draft.foundedDate)}
        onChange={(date) => patchDraft({ foundedDate: toDateString(date) })}
        placeholder="창업일 선택"
        title="창업일 선택"
      />
    </OnboardingStepLayout>
  )
}
