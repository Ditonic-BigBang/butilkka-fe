import { useState } from 'react'
import { StoreLocationPicker } from '@/widgets/store-location-picker'
import { lookupRegion, type StoreLocation } from '@/entities/store'
import { useOnboardingStore, canProceed } from '../../model/useOnboardingStore'
import { OnboardingStepLayout } from '../OnboardingStepLayout'

/**
 * 가게 주소 스텝 (Figma: 288:4682 · 300:5592).
 * 필드를 누르면 주소 검색 → 지도 확인(store-location-picker) 서브플로우로 진입,
 * 확정하면 도로명 주소가 필드에 채워진다.
 */
export function AddressStep() {
  const { draft, patchDraft, terms, next, back } = useOnboardingStore()
  const [picking, setPicking] = useState(false)

  // 위치 확정 → 상권코드 매핑 (최종 저장 PUT 에 regionCode 필요).
  // 실패해도 스텝 진행은 막지 않는다 — 완료 시점에 다시 검증.
  const completeLocation = (location: StoreLocation) => {
    patchDraft({ location, region: undefined })
    setPicking(false)
    void lookupRegion({ lat: location.lat, lng: location.lng })
      .then((regions) => patchDraft({ region: regions[0] }))
      .catch(() => {
        // 매칭 상권 없음(404 등) — region 없이 두고 완료 단계에서 안내
      })
  }

  if (picking) {
    return (
      <StoreLocationPicker
        cta="이 위치로 등록하기"
        onClose={() => setPicking(false)}
        onComplete={completeLocation}
      />
    )
  }

  const address = draft.location?.roadAddress

  return (
    <OnboardingStepLayout
      title={'본인의 가게 주소를\n입력해주세요'}
      subtitle="입력된 주소 중심으로 상권 분석을 해드릴게요."
      onBack={back}
      ctaDisabled={!canProceed('address', { draft, terms })}
      onCta={next}
    >
      <div className="flex flex-col gap-2">
        {/* 주소 필드 — 자유 입력이 아니라 검색 플로우 트리거 (TextField 셸과 동일 스타일) */}
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex h-12 w-full items-center rounded-8 bg-gray-70 px-4 text-body-l-regular"
        >
          <span className={address ? 'truncate text-gray-900' : 'text-gray-300'}>
            {address ?? '도로명 또는 지번 입력'}
          </span>
        </button>
        <p className="text-body-m-regular text-gray-300">추후에 변경할 수 있습니다.</p>
      </div>
    </OnboardingStepLayout>
  )
}
