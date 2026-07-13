import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { useKakaoMapsSDK } from '@/shared/lib/useKakaoMapsSDK'
import { LocationMarker, Spinner } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

/** 지도 위 등급 마커 데이터 (좌표 + LocationMarker 내용) */
export type MapMarker = {
  id: string
  lat: number
  lng: number
  /** 마커 제목 (예: "서대문구") */
  title: string
  /** 보조 텍스트 (예: "C등급") */
  caption?: string
}

export type KakaoMapHandle = {
  /** 좌표로 부드럽게 이동, level 지정 시 줌도 변경 */
  panTo: (lat: number, lng: number, level?: number) => void
}

type KakaoMapProps = {
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  className?: string
  ref?: Ref<KakaoMapHandle>
}

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 }
const DEFAULT_LEVEL = 9

const NO_MARKERS: MapMarker[] = []

/**
 * 상권 지도 (Figma: 지도 홈 596:23173).
 * 카카오맵 + 구 단위 쇠퇴등급 마커(LocationMarker)를 CustomOverlay 로 표시.
 * 마커 클릭은 portal 로 React 이벤트를 그대로 사용 — kakao 이벤트를 거치지 않는다.
 */
export default function KakaoMap({
  markers = NO_MARKERS,
  onMarkerClick,
  className,
  ref,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<kakao.maps.Map | null>(null)
  // 마커별 portal 컨테이너 — CustomOverlay content 로 붙인 DOM 노드
  const [overlayEls, setOverlayEls] = useState<{ id: string; el: HTMLDivElement }[]>([])

  const { isLoaded, error } = useKakaoMapsSDK()

  useImperativeHandle(ref, () => ({
    panTo: (lat, lng, level) => {
      if (!map) return
      if (level !== undefined) map.setLevel(level)
      map.panTo(new kakao.maps.LatLng(lat, lng))
    },
  }))

  // 지도 생성 (SDK 로드 후 1회)
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return
    const instance = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
      level: DEFAULT_LEVEL,
    })
    setMap(instance)
  }, [isLoaded])

  // 마커 오버레이 생성/갱신
  useEffect(() => {
    if (!map || markers.length === 0) return

    const created = markers.map((marker) => {
      const el = document.createElement('div')
      const overlay = new kakao.maps.CustomOverlay({
        content: el,
        position: new kakao.maps.LatLng(marker.lat, marker.lng),
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 10,
        clickable: true,
      })
      overlay.setMap(map)
      return { id: marker.id, el, overlay }
    })
    setOverlayEls(created.map(({ id, el }) => ({ id, el })))

    return () => {
      created.forEach(({ overlay }) => overlay.setMap(null))
      setOverlayEls([])
    }
  }, [map, markers])

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-70 px-5', className)}>
        <p className="text-center text-body-m-medium text-gray-500">{error}</p>
      </div>
    )
  }

  const markerById = new Map(markers.map((m) => [m.id, m]))

  return (
    <div className={className}>
      {!isLoaded && (
        <div className="flex size-full items-center justify-center bg-gray-70">
          <Spinner />
        </div>
      )}
      <div ref={containerRef} className={cn('size-full', !isLoaded && 'hidden')} />
      {overlayEls.map(({ id, el }) => {
        const marker = markerById.get(id)
        if (!marker) return null
        return createPortal(
          <LocationMarker
            title={marker.title}
            caption={marker.caption}
            onClick={onMarkerClick ? () => onMarkerClick(id) : undefined}
            className={onMarkerClick ? 'cursor-pointer' : undefined}
          />,
          el,
          id,
        )
      })}
    </div>
  )
}
