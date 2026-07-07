import { TextField } from '@/shared/ui'
import { useOnboardingStore, canProceed } from '../../model/useOnboardingStore'
import { OnboardingStepLayout } from '../OnboardingStepLayout'

const MAX_LENGTH = 25

/**
 * 가게 이름 스텝 (Figma: 310:6746 · 310:6819).
 * 자유 입력(25자 제한) — 입력 시 CTA 활성.
 */
export function NameStep() {
  const { draft, patchDraft, terms, next, back } = useOnboardingStore()

  return (
    <OnboardingStepLayout
      title="가게 이름을 입력해주세요"
      subtitle="추후에 변경할 수 있어요."
      onBack={back}
      ctaDisabled={!canProceed('name', { draft, terms })}
      onCta={next}
    >
      <TextField
        value={draft.name ?? ''}
        onChange={(name) => patchDraft({ name: name.slice(0, MAX_LENGTH) })}
        placeholder="가게 이름 입력"
        caption="공백포함 25자 이내 영문 대/소문자, 숫자, 특수문자 포함"
      />
    </OnboardingStepLayout>
  )
}
