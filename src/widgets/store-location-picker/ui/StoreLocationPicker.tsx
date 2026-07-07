import { useState } from 'react'
import { useKakaoMapsSDK } from '@/shared/lib/useKakaoMapsSDK'
import type { StoreLocation } from '@/entities/store'
import { AddressSearch } from './AddressSearch'
import { LocationConfirmMap } from './LocationConfirmMap'

type StoreLocationPickerProps = {
  /** 지도에서 위치 확정 시 */
  onComplete: (location: StoreLocation) => void
  /** 검색 화면에서 뒤로가기 (플로우 이탈) */
  onClose?: () => void
  /** 확정 CTA 라벨 (기본 '이 위치로 등록하기') */
  cta?: string
}

/**
 * 가게 위치 선택 플로우 — 주소 검색 → 지도에서 위치 확인.
 * 온보딩(가게 주소 스텝)과 마이페이지(가게위치 변경/추가)가 공유한다.
 * Figma: [4-2] 가게위치 변경하기 4~6 (446:21435 → 446:21470 → 446:21799).
 */
export function StoreLocationPicker({ onComplete, onClose, cta }: StoreLocationPickerProps) {
  const { isLoaded } = useKakaoMapsSDK()
  const [confirming, setConfirming] = useState<StoreLocation | null>(null)

  if (confirming) {
    return (
      <LocationConfirmMap
        initial={confirming}
        sdkReady={isLoaded}
        cta={cta}
        onBack={() => setConfirming(null)}
        onConfirm={onComplete}
      />
    )
  }

  return <AddressSearch sdkReady={isLoaded} onBack={onClose} onSelect={setConfirming} />
}
