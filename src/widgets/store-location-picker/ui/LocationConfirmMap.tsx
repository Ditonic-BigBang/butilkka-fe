import { useEffect, useRef, useState } from 'react'
import { GNB } from '@/widgets/mobile-layout'
import { CTA, MapPin, MyLocation } from '@/shared/ui'
import type { StoreLocation } from '@/entities/store'
import { coordToLocation } from '../model/useAddressSearch'

const MAP_LEVEL = 3

type LocationConfirmMapProps = {
  /** 검색에서 선택한 초기 위치 */
  initial: StoreLocation
  onConfirm: (location: StoreLocation) => void
  onBack?: () => void
  /** 카카오맵 SDK 로드 여부 */
  sdkReady: boolean
  /** CTA 라벨 (기본 '이 위치로 등록하기') */
  cta?: string
}

/**
 * 지도 위치 확인 (Figma: 가게위치 변경하기/6 — 446:21799).
 * 중앙 고정 핀("위치가 맞는지 확인해주세요!" 툴팁) + 지도 드래그로 미세 조정 →
 * 이동이 멈추면 역지오코딩으로 하단 주소 카드를 갱신. CTA 로 확정.
 */
export function LocationConfirmMap({
  initial,
  onConfirm,
  onBack,
  sdkReady,
  cta = '이 위치로 등록하기',
}: LocationConfirmMapProps) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [current, setCurrent] = useState<StoreLocation>(initial)

  useEffect(() => {
    if (!sdkReady || !mapEl.current) return

    const map = new kakao.maps.Map(mapEl.current, {
      center: new kakao.maps.LatLng(initial.lat, initial.lng),
      level: MAP_LEVEL,
    })
    mapRef.current = map

    // 지도 이동이 멈추면 중심 좌표 → 주소 갱신
    const handleIdle = () => {
      const center = map.getCenter()
      void coordToLocation(center.getLat(), center.getLng()).then((loc) => {
        if (loc) setCurrent(loc)
      })
    }
    kakao.maps.event.addListener(map, 'idle', handleIdle)

    return () => {
      kakao.maps.event.removeListener(map, 'idle', handleIdle)
      mapRef.current = null
    }
    // 초기 위치는 마운트 시 한 번만 — 이후에는 지도 조작으로만 이동
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady])

  const moveToCurrentLocation = () => {
    if (!mapRef.current || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      mapRef.current?.setCenter(new kakao.maps.LatLng(coords.latitude, coords.longitude))
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <GNB title="지도에서 위치 확인" showSettings={false} onBack={onBack} />

      {/* 지도 + 중앙 핀 */}
      <div className="relative min-h-0 flex-1 bg-gray-70">
        {sdkReady ? (
          <div ref={mapEl} className="size-full" />
        ) : (
          <div className="flex size-full items-center justify-center text-body-m-regular text-gray-400">
            지도를 불러오는 중…
          </div>
        )}

        {/* 중앙 고정 핀 — 핀 끝이 지도 중심을 가리키도록 배치, 드래그는 지도가 받게 통과 */}
        {/* z-10: 카카오맵 내부 타일이 z-index 를 가져서 명시해야 위로 뜬다 */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-3">
          <p className="rounded-12 bg-gray-800 p-3 text-body-m-medium whitespace-nowrap text-white">
            위치가 맞는지 확인해주세요!
          </p>
          <MapPin variant="active" />
        </div>

        <MyLocation
          aria-label="현재 위치로 이동"
          onClick={moveToCurrentLocation}
          className="absolute right-5 bottom-5 z-10"
        />
      </div>

      {/* 주소 카드 */}
      <div className="px-5 pt-6 pb-1">
        <div className="flex flex-col gap-1 rounded-10 border border-gray-100 px-4 py-3">
          <p className="text-body-l-medium text-gray-900">{current.roadAddress}</p>
          {current.jibunAddress && (
            <p className="text-body-m-regular text-gray-500">{current.jibunAddress}</p>
          )}
        </div>
      </div>

      <CTA onClick={() => onConfirm(current)}>{cta}</CTA>
    </div>
  )
}
