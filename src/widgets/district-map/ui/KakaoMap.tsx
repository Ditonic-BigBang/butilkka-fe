import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { useKakaoMapsSDK } from '@/shared/lib/useKakaoMapsSDK'
import { LocationMarker, MapPin, Spinner } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import iconGps from '../assets/icon-gps.svg'

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

/** 구 경계 폴리곤 — 외곽 링 좌표 묶음 (색 미지정 시 오렌지 강조) */
export type MapOutline = {
  id: string
  rings: { lat: number; lng: number }[][]
  /** 라인·채움 색 (예: 즐겨찾기 선택 핑크) */
  color?: string
  fillOpacity?: number
}

type KakaoMapProps = {
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  /** 구 경계 폴리곤 (라인 + 옅은 채움) */
  outlines?: MapOutline[]
  /** 현재 위치 GPS 점 (Figma: icon_gps 1418:14548) — 없으면 표시 안 함 */
  myLocation?: { lat: number; lng: number } | null
  /** 선택 핀 (Figma: Map Pin) — 즐겨찾기 지도에서 선택 모드 */
  pin?: { lat: number; lng: number } | null
  /** 지도 빈 곳 클릭 (kakao 클릭 이벤트 — 드래그와 자동 구분됨) */
  onMapClick?: (point: { lat: number; lng: number }) => void
  /** 지도 인스턴스 생성 완료 — 초기 위치 이동 등 ref 조작이 가능해진 시점 */
  onReady?: () => void
  className?: string
  ref?: Ref<KakaoMapHandle>
}

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 }
const DEFAULT_LEVEL = 9

// 구 경계 스타일 — orange-500(@theme). kakao Polygon 은 CSS 변수를 못 받아 hex 로 미러링.
const OUTLINE_COLOR = '#ff6b1b'
const OUTLINE_FILL_OPACITY = 0.2

const NO_MARKERS: MapMarker[] = []
const NO_OUTLINES: MapOutline[] = []

/**
 * 상권 지도 (Figma: 지도 홈 596:23173).
 * 카카오맵 + 구 단위 쇠퇴등급 마커(LocationMarker)를 CustomOverlay 로 표시.
 * 마커 클릭은 portal 로 React 이벤트를 그대로 사용 — kakao 이벤트를 거치지 않는다.
 */
export default function KakaoMap({
  markers = NO_MARKERS,
  onMarkerClick,
  outlines = NO_OUTLINES,
  myLocation,
  pin,
  onMapClick,
  onReady,
  className,
  ref,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<kakao.maps.Map | null>(null)
  // 마커별 portal 컨테이너 — CustomOverlay content 로 붙인 DOM 노드
  const [overlayEls, setOverlayEls] = useState<{ id: string; el: HTMLDivElement }[]>([])
  const [myLocationEl, setMyLocationEl] = useState<HTMLDivElement | null>(null)
  const [pinEl, setPinEl] = useState<HTMLDivElement | null>(null)

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

  // 생성 완료 알림 — 콜백 참조 변경으로 지도를 재생성하지 않게 ref 로 최신 콜백만 유지
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady
  useEffect(() => {
    if (map) onReadyRef.current?.()
  }, [map])

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

  // 구 경계 폴리곤 — 오렌지 라인 + 20% 채움
  useEffect(() => {
    if (!map || outlines.length === 0) return

    const polygons = outlines.flatMap((outline) =>
      outline.rings.map((ring) => {
        const color = outline.color ?? OUTLINE_COLOR
        const polygon = new kakao.maps.Polygon({
          map,
          path: ring.map((p) => new kakao.maps.LatLng(p.lat, p.lng)),
          strokeWeight: 1.5,
          strokeColor: color,
          strokeOpacity: 1,
          fillColor: color,
          fillOpacity: outline.fillOpacity ?? OUTLINE_FILL_OPACITY,
          zIndex: 1,
        })
        return polygon
      }),
    )

    return () => {
      polygons.forEach((polygon) => polygon.setMap(null))
    }
  }, [map, outlines])

  // 지도 클릭 (kakao 이벤트 — 드래그 후에는 발생하지 않아 탭/패닝 구분이 필요 없다)
  useEffect(() => {
    if (!map || !onMapClick) return
    const handler = (...args: unknown[]) => {
      const e = args[0] as kakao.maps.MapMouseEvent
      onMapClick({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
    }
    kakao.maps.event.addListener(map, 'click', handler)
    return () => kakao.maps.event.removeListener(map, 'click', handler)
  }, [map, onMapClick])

  // 선택 핀 오버레이 — 핀 꼭짓점이 좌표를 가리키게 yAnchor 1
  useEffect(() => {
    if (!map || !pin) return

    const el = document.createElement('div')
    const overlay = new kakao.maps.CustomOverlay({
      content: el,
      position: new kakao.maps.LatLng(pin.lat, pin.lng),
      xAnchor: 0.5,
      yAnchor: 1,
      zIndex: 30,
    })
    overlay.setMap(map)
    setPinEl(el)

    return () => {
      overlay.setMap(null)
      setPinEl(null)
    }
  }, [map, pin])

  // 현재 위치 GPS 점 오버레이
  useEffect(() => {
    if (!map || !myLocation) return

    const el = document.createElement('div')
    const overlay = new kakao.maps.CustomOverlay({
      content: el,
      position: new kakao.maps.LatLng(myLocation.lat, myLocation.lng),
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 20,
    })
    overlay.setMap(map)
    setMyLocationEl(el)

    return () => {
      overlay.setMap(null)
      setMyLocationEl(null)
    }
  }, [map, myLocation])

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
      {myLocationEl &&
        createPortal(
          <img src={iconGps} alt="현재 위치" className="pointer-events-none w-[50px] max-w-none" />,
          myLocationEl,
        )}
      {pinEl && createPortal(<MapPin variant="inactive" className="pointer-events-none" />, pinEl)}
      {overlayEls.map(({ id, el }) => {
        const marker = markerById.get(id)
        if (!marker) return null
        return createPortal(
          // 마커 탭은 상세 진입 — 지도 빈 곳 탭(시트 접기 등)과 구분되게 전파를 끊는다
          <div role="presentation" onClick={(e) => e.stopPropagation()}>
            <LocationMarker
              title={marker.title}
              caption={marker.caption}
              onClick={onMarkerClick ? () => onMarkerClick(id) : undefined}
              className={onMarkerClick ? 'cursor-pointer' : undefined}
            />
          </div>,
          el,
          id,
        )
      })}
    </div>
  )
}
