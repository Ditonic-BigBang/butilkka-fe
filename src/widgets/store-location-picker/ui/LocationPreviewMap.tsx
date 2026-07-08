import { useEffect, useRef } from 'react'
import { MapPin } from '@/shared/ui'
import { useKakaoMapsSDK } from '@/shared/lib/useKakaoMapsSDK'
import { cn } from '@/shared/lib/cn'

const MAP_LEVEL = 3

type LocationPreviewMapProps = {
  lat: number
  lng: number
  /** 클릭 시 위치 재선택 플로우 진입 (부모가 처리) */
  onClick?: () => void
  className?: string
}

/**
 * 위치 프리뷰 미니맵 (Figma: 가게위치 변경하기/3 — 301:5545).
 * 선택된 좌표를 중심으로 한 비활성(드래그·줌 off) 카카오맵 + 중앙 고정 핀.
 * 클릭하면 지도에서 위치 확인 플로우로 진입한다.
 */
export function LocationPreviewMap({ lat, lng, onClick, className }: LocationPreviewMapProps) {
  const { isLoaded } = useKakaoMapsSDK()
  const mapEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoaded || !mapEl.current) return
    const map = new kakao.maps.Map(mapEl.current, {
      center: new kakao.maps.LatLng(lat, lng),
      level: MAP_LEVEL,
      draggable: false,
    })
    map.setZoomable(false)
    // 카카오맵은 명시적 destroy API 가 없다 — el 언마운트 시 GC 로 정리
  }, [isLoaded, lat, lng])

  return (
    <div
      className={cn('relative h-[124px] w-full overflow-hidden border border-gray-100', className)}
    >
      {isLoaded ? (
        <div ref={mapEl} className="size-full" />
      ) : (
        <div className="flex size-full items-center justify-center bg-gray-70 text-body-m-regular text-gray-400">
          지도를 불러오는 중…
        </div>
      )}

      {/* 중앙 고정 핀 — 핀 끝이 지도 중심(선택 좌표)을 가리킨다.
          z-10: 카카오맵 내부 타일이 z-index 를 가져서 명시해야 위로 뜬다 */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <MapPin />
      </div>

      {/* 클릭 오버레이 — 지도 인터랙션 대신 위치 재선택 진입 */}
      {onClick && (
        <button
          type="button"
          aria-label="지도에서 위치 확인"
          onClick={onClick}
          className="absolute inset-0 z-20"
        />
      )}
    </div>
  )
}
