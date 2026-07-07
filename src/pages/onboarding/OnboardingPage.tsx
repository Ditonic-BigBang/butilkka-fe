import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { MobileLayout } from '@/widgets/mobile-layout'
import { useAuthStore } from '@/entities/session'
import { putMyStore } from '@/entities/store'
import { ONBOARDING_STEPS } from './model/steps'
import { useOnboardingStore } from './model/useOnboardingStore'
import { TermsStep } from './ui/steps/TermsStep'
import { AddressStep } from './ui/steps/AddressStep'
import { IndustryStep } from './ui/steps/IndustryStep'
import { NameStep } from './ui/steps/NameStep'
import { FoundedStep } from './ui/steps/FoundedStep'
import { CompleteStep } from './ui/steps/CompleteStep'

/**
 * 온보딩 위저드 (Figma: [1-2] 온보딩).
 * 단일 라우트(/onboarding) 안에서 약관 → 주소 → 업종 → 이름 → 창업일 → 완료 스텝 전환.
 * 완료 '다음'에서 PUT /api/v1/users/me/store 로 draft 를 저장한다.
 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const stepIndex = useOnboardingStore((s) => s.stepIndex)
  const draft = useOnboardingStore((s) => s.draft)
  const reset = useOnboardingStore((s) => s.reset)
  const step = ONBOARDING_STEPS[stepIndex]

  const saveStore = useMutation({
    mutationFn: putMyStore,
    // 저장 성공 → 가이드로 이동. isOnboarded 플립은 가이드 마지막 '시작하기'에서 한다.
    // (여기서 플립하면 아래 'onboarded → 홈' 가드와 경합해 가이드를 건너뛰고 홈으로 튄다)
    onSuccess: () => {
      reset()
      navigate('/onboarding/guide', { replace: true })
    },
  })

  if (status !== 'authenticated') return <Navigate to="/login" replace />
  if (user?.isOnboarded) return <Navigate to="/" replace />

  const finish = () => {
    const { name, location, region, categoryCode, foundedDate } = draft
    // 스텝별 CTA 게이팅으로 대부분 보장되지만, region 은 비동기 매핑이라 최종 검증
    if (!name || !location || !categoryCode || !foundedDate) return
    if (!region) {
      saveStore.reset()
      alert('가게 주소의 상권 정보를 찾지 못했어요. 주소를 다시 선택해주세요.')
      return
    }

    saveStore.mutate({
      regionCode: region.regionCode,
      categoryCode,
      lat: location.lat,
      lng: location.lng,
      storeName: name,
      storeOpenDate: foundedDate,
    })
  }

  return (
    <MobileLayout showBottomTab={false}>
      {step === 'terms' && <TermsStep />}
      {step === 'address' && <AddressStep />}
      {step === 'industry' && <IndustryStep />}
      {step === 'name' && <NameStep />}
      {step === 'founded' && <FoundedStep />}
      {step === 'complete' && (
        <CompleteStep
          onFinish={finish}
          pending={saveStore.isPending}
          errorMessage={saveStore.error?.message}
        />
      )}
    </MobileLayout>
  )
}
