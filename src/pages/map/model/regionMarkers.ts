import type { RegionGrade, RegionMapItem } from '@/entities/region'
import type { LatLngPoint } from '@/entities/district'
import type { MapMarker } from '@/widgets/district-map'

// 등급 심각도 — 뒤로 갈수록 위험(E 최악)
const GRADE_SEVERITY: Record<RegionGrade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 }

/**
 * regions/map 응답(상권 단위) → 구 단위 지도 마커.
 * API 가 좌표를 안 내려주므로 위치는 geojson 구 센트로이드를 쓰고,
 * 한 구에 상권이 여러 개면 가장 위험한(심각도 높은) 등급으로 대표한다.
 */
export function buildGuMarkers(
  regions: RegionMapItem[],
  centroids: Map<string, LatLngPoint>,
): MapMarker[] {
  const worstByGu = new Map<string, RegionGrade>()
  regions.forEach(({ district, grade }) => {
    const prev = worstByGu.get(district)
    if (!prev || GRADE_SEVERITY[grade] > GRADE_SEVERITY[prev]) worstByGu.set(district, grade)
  })

  const markers: MapMarker[] = []
  worstByGu.forEach((grade, district) => {
    const point = centroids.get(district)
    if (!point) return // geojson 에 없는 구(비서울 등)는 표시하지 않음
    markers.push({
      id: district,
      lat: point.lat,
      lng: point.lng,
      title: district,
      caption: `${grade}등급`,
    })
  })
  return markers
}
