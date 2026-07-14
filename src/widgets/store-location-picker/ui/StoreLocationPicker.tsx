import { useEffect, useState } from 'react'
import { GNB } from '@/widgets/mobile-layout'
import { useKakaoMapsSDK } from '@/shared/lib/useKakaoMapsSDK'
import type { StoreLocation } from '@/entities/store'
import { AddressSearch } from './AddressSearch'
import { LocationConfirmMap } from './LocationConfirmMap'
import { coordToLocation } from '../model/useAddressSearch'

type StoreLocationPickerProps = {
  /** 지도에서 위치 확정 시 */
  onComplete: (location: StoreLocation) => void
  /** 검색 화면에서 뒤로가기 (플로우 이탈) */
  onClose?: () => void
  /** 확정 CTA 라벨 (기본 '이 위치로 등록하기') */
  cta?: string
  /** true 면 주소 검색을 건너뛰고 현재 위치로 바로 지도 확인 화면을 연다 */
  startWithCurrentLocation?: boolean
  /** 지정 좌표로 바로 지도 확인 화면을 연다 (검색 생략) — 폼 미니맵 → 위치 확인 진입용 */
  startWithLocation?: StoreLocation
}

/**
 * 가게 위치 선택 플로우 — 주소 검색 → 지도에서 위치 확인.
 * `startWithCurrentLocation` 이면 현위치, `startWithLocation` 이면 지정 좌표를 잡아
 * 곧바로 지도 확인으로 진입한다(검색 생략).
 * 온보딩(가게 주소 스텝)과 마이페이지(가게위치 변경/추가)가 공유한다.
 * Figma: [4-2] 가게위치 변경하기 4~6 (446:21435 → 446:21470 → 446:21799).
 */
export function StoreLocationPicker({
  onComplete,
  onClose,
  cta,
  startWithCurrentLocation = false,
  startWithLocation,
}: StoreLocationPickerProps) {
  const { isLoaded } = useKakaoMapsSDK()
  const [confirming, setConfirming] = useState<StoreLocation | null>(startWithLocation ?? null)
  const [locating, setLocating] = useState(startWithCurrentLocation)
  // 검색을 거치지 않고 바로 지도 확인으로 들어온 경우 — 뒤로가기는 검색이 아니라 호출처로
  const startedDirect = startWithCurrentLocation || startWithLocation !== undefined

  // 현위치 시작 모드: SDK 로드되면 현재 좌표 → 역지오코딩 → 지도 확인으로 바로 진입
  useEffect(() => {
    if (!startWithCurrentLocation || !isLoaded) return
    if (!navigator.geolocation) {
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const location = await coordToLocation(coords.latitude, coords.longitude)
        setLocating(false)
        if (location) setConfirming(location)
      },
      () => setLocating(false),
    )
  }, [startWithCurrentLocation, isLoaded])

  if (confirming) {
    return (
      <LocationConfirmMap
        initial={confirming}
        sdkReady={isLoaded}
        cta={cta}
        // 검색 없이 바로 진입한 경우 뒤로가기는 호출처로 닫기, 검색 경유면 검색 화면으로
        onBack={startedDirect ? onClose : () => setConfirming(null)}
        onConfirm={onComplete}
      />
    )
  }

  // 현위치 확인 중 로딩 (실패하면 아래 주소 검색으로 폴백)
  if (locating) {
    return (
      <div className="flex min-h-full flex-col bg-white">
        <GNB title="주소 검색" showSettings={false} onBack={onClose} />
        <p className="flex flex-1 items-center justify-center py-20 text-body-m-regular text-gray-400">
          현재 위치를 확인하는 중…
        </p>
      </div>
    )
  }

  return <AddressSearch sdkReady={isLoaded} onBack={onClose} onSelect={setConfirming} />
}
