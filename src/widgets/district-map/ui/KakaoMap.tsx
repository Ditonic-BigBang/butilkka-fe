import { memo, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
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
  /**
   * 좌표로 부드럽게 이동, level 지정 시 줌도 변경.
   * offsetY(px) 지정 시 좌표가 화면 중앙보다 그만큼 위에 오도록 보정 —
   * 상/하단 오버레이(검색바·시트)에 가려지지 않는 영역 기준 센터링용.
   */
  panTo: (lat: number, lng: number, level?: number, offsetY?: number) => void
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
const FOCUS_ZOOM_MS = 350
// LocationMarker 의 지름(94px) 절반. 오버레이는 지도 제스처를 막지 않게 클릭을 통과시키고,
// 지도 클릭 좌표가 이 반경 안에 있을 때만 마커 탭으로 판정한다.
const MARKER_HIT_RADIUS = 47

// 구 경계 스타일 — orange-500(@theme). kakao Polygon 은 CSS 변수를 못 받아 hex 로 미러링.
const OUTLINE_COLOR = '#ff6b1b'
const OUTLINE_FILL_OPACITY = 0.2

const NO_MARKERS: MapMarker[] = []
const NO_OUTLINES: MapOutline[] = []

type MarkerOverlayEntry = {
  el: HTMLDivElement
  overlay: kakao.maps.CustomOverlay
  lat: number
  lng: number
}

/**
 * 상권 지도 (Figma: 지도 홈 596:23173).
 * 카카오맵 + 구 단위 쇠퇴등급 마커(LocationMarker)를 CustomOverlay 로 표시.
 * 마커 클릭은 portal 로 React 이벤트를 그대로 사용 — kakao 이벤트를 거치지 않는다.
 */
function KakaoMap({
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
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null)
  const focusTimerRef = useRef<number | null>(null)
  // 마커별 portal 컨테이너 — CustomOverlay content 로 붙인 DOM 노드
  const [overlayEls, setOverlayEls] = useState<{ id: string; el: HTMLDivElement }[]>([])
  const markerOverlaysRef = useRef(new Map<string, MarkerOverlayEntry>())
  const overlayIdsRef = useRef<string[]>([])
  const [myLocationEl, setMyLocationEl] = useState<HTMLDivElement | null>(null)
  const [pinEl, setPinEl] = useState<HTMLDivElement | null>(null)

  const { isLoaded, error } = useKakaoMapsSDK()

  useImperativeHandle(ref, () => ({
    panTo: (lat, lng, level, offsetY) => {
      if (!map) return
      const target = new kakao.maps.LatLng(lat, lng)

      if (focusTimerRef.current !== null) {
        window.clearTimeout(focusTimerRef.current)
        focusTimerRef.current = null
      }

      // 선택한 원을 anchor로 화면에 유지한 채 확대하고, 확대가 끝난 뒤 중심으로 이동한다.
      if (level !== undefined && !offsetY) {
        if (map.getLevel() === level) {
          map.panTo(target)
          return
        }
        map.setLevel(level, {
          anchor: target,
          animate: { duration: FOCUS_ZOOM_MS },
        })
        focusTimerRef.current = window.setTimeout(() => {
          map.panTo(target)
          focusTimerRef.current = null
        }, FOCUS_ZOOM_MS)
        return
      }

      if (level !== undefined) map.setLevel(level)
      if (!offsetY) {
        map.panTo(target)
        return
      }
      // 오프셋 센터링 — 좌표가 화면 중앙보다 offsetY(px) 만큼 위에 오도록
      // 중심을 화면 기준 아래로 이동 (panBy 는 화면 픽셀 기준이라 좌표계 뒤집힘 걱정이 없다)
      map.setCenter(target)
      map.panBy(0, offsetY)
    },
  }))

  useEffect(
    () => () => {
      if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current)
    },
    [],
  )

  // 지도 생성 (SDK 로드 후 1회)
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstanceRef.current) return
    const instance = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
      level: DEFAULT_LEVEL,
    })
    mapInstanceRef.current = instance
    setMap(instance)
  }, [isLoaded])

  // 생성 완료 알림 — 콜백 참조 변경으로 지도를 재생성하지 않게 ref 로 최신 콜백만 유지
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady
  useEffect(() => {
    if (map) onReadyRef.current?.()
  }, [map])

  // 마커 오버레이 조정 — ID가 유지되면 위치만 옮기고 portal 내용은 React가 갱신한다.
  useEffect(() => {
    if (!map) return

    const nextIds = markers.map((marker) => marker.id)
    const nextIdSet = new Set(nextIds)

    markerOverlaysRef.current.forEach((entry, id) => {
      if (nextIdSet.has(id)) return
      entry.overlay.setMap(null)
      markerOverlaysRef.current.delete(id)
    })

    markers.forEach((marker) => {
      const existing = markerOverlaysRef.current.get(marker.id)
      if (existing) {
        if (existing.lat !== marker.lat || existing.lng !== marker.lng) {
          existing.overlay.setPosition(new kakao.maps.LatLng(marker.lat, marker.lng))
          existing.lat = marker.lat
          existing.lng = marker.lng
        }
        return
      }

      const el = document.createElement('div')
      // 검은 마커 위에서 시작한 터치도 지도 드래그로 이어지게 한다.
      // 탭 선택은 아래 kakao map click 이벤트에서 좌표 기반으로 처리한다.
      el.style.pointerEvents = 'none'
      const overlay = new kakao.maps.CustomOverlay({
        content: el,
        position: new kakao.maps.LatLng(marker.lat, marker.lng),
        xAnchor: 0,
        yAnchor: 0,
        zIndex: 10,
      })
      overlay.setMap(map)
      markerOverlaysRef.current.set(marker.id, {
        el,
        overlay,
        lat: marker.lat,
        lng: marker.lng,
      })
    })

    const idsChanged =
      nextIds.length !== overlayIdsRef.current.length ||
      nextIds.some((id, index) => id !== overlayIdsRef.current[index])
    if (idsChanged) {
      overlayIdsRef.current = nextIds
      setOverlayEls(
        nextIds.flatMap((id) => {
          const entry = markerOverlaysRef.current.get(id)
          return entry ? [{ id, el: entry.el }] : []
        }),
      )
    }
  }, [map, markers])

  // 실제 지도 인스턴스가 사라질 때에만 마커 오버레이를 정리한다.
  useEffect(() => {
    if (!map) return
    const markerOverlays = markerOverlaysRef.current
    const overlayIds = overlayIdsRef
    return () => {
      markerOverlays.forEach(({ overlay }) => overlay.setMap(null))
      markerOverlays.clear()
      overlayIds.current = []
      setOverlayEls([])
    }
  }, [map])

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

  // 지도 클릭 (kakao 이벤트 — 드래그 후에는 발생하지 않아 탭/패닝 구분이 필요 없다).
  // 마커 DOM 이 포인터 이벤트를 가로채지 않으므로 좌표가 원 안에 있는지 계산해 마커 탭을 구분한다.
  const markersRef = useRef(markers)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onMapClickRef = useRef(onMapClick)
  markersRef.current = markers
  onMarkerClickRef.current = onMarkerClick
  onMapClickRef.current = onMapClick

  useEffect(() => {
    if (!map) return
    const handler = (...args: unknown[]) => {
      const e = args[0] as kakao.maps.MapMouseEvent
      const currentMarkers = markersRef.current
      const currentMarkerClick = onMarkerClickRef.current

      if (currentMarkerClick && currentMarkers.length > 0) {
        const projection = map.getProjection()
        const clicked = projection.pointFromCoords(e.latLng)
        const hitRadiusSquared = MARKER_HIT_RADIUS ** 2
        let closestMarker: MapMarker | undefined
        let closestDistanceSquared = Number.POSITIVE_INFINITY

        for (const marker of currentMarkers) {
          const point = projection.pointFromCoords(new kakao.maps.LatLng(marker.lat, marker.lng))
          const distanceSquared = (point.x - clicked.x) ** 2 + (point.y - clicked.y) ** 2
          if (distanceSquared <= hitRadiusSquared && distanceSquared < closestDistanceSquared) {
            closestMarker = marker
            closestDistanceSquared = distanceSquared
          }
        }

        if (closestMarker) {
          currentMarkerClick(closestMarker.id)
          return
        }
      }

      onMapClickRef.current?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
    }
    kakao.maps.event.addListener(map, 'click', handler)
    return () => kakao.maps.event.removeListener(map, 'click', handler)
  }, [map])

  // 선택 핀 오버레이 — 핀 꼭짓점이 좌표를 가리키게 yAnchor 1
  useEffect(() => {
    if (!map || !pin) return

    const el = document.createElement('div')
    const overlay = new kakao.maps.CustomOverlay({
      content: el,
      position: new kakao.maps.LatLng(pin.lat, pin.lng),
      xAnchor: 0,
      yAnchor: 0,
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
      xAnchor: 0,
      yAnchor: 0,
      zIndex: 20,
    })
    overlay.setMap(map)
    setMyLocationEl(el)

    return () => {
      overlay.setMap(null)
      setMyLocationEl(null)
    }
  }, [map, myLocation])

  const markerById = useMemo(() => new Map(markers.map((m) => [m.id, m])), [markers])

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-70 px-5', className)}>
        <p className="text-center text-body-m-medium text-gray-500">{error}</p>
      </div>
    )
  }

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
          <img
            src={iconGps}
            alt="현재 위치"
            className="pointer-events-none w-[50px] max-w-none -translate-x-1/2 -translate-y-1/2"
          />,
          myLocationEl,
        )}
      {/* 핀은 꼭짓점(바닥)이 좌표를 가리키게 아래 기준 정렬 */}
      {pinEl &&
        createPortal(
          <MapPin
            variant="inactive"
            className="pointer-events-none -translate-x-1/2 -translate-y-full"
          />,
          pinEl,
        )}
      {overlayEls.map(({ id, el }) => {
        const marker = markerById.get(id)
        if (!marker) return null
        return createPortal(
          <LocationMarker
            title={marker.title}
            caption={marker.caption}
            className="pointer-events-none -translate-x-1/2 -translate-y-1/2"
          />,
          el,
          id,
        )
      })}
    </div>
  )
}

// MapPage 는 검색 타이핑 등으로 리렌더가 잦다 — props(markers/outlines/콜백)는 전부
// 상위에서 useMemo/useCallback 으로 안정화돼 있어 memo 로 마커 포털 재조정을 차단한다.
export default memo(KakaoMap)
