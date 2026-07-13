import type { RegionGrade, RegionMapItem } from '@/entities/region'
import type { LatLngPoint } from '@/entities/district'
import type { MapMarker } from '@/widgets/district-map'

// 등급 심각도 — 뒤로 갈수록 위험(E 최악)
const GRADE_SEVERITY: Record<RegionGrade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 }

/**
 * 구별 대표(가장 위험한 등급) 상권.
 * 마커 등급 표기와 구 선택 시 상세 조회(regionCode)가 같은 상권을 가리키게 한다.
 */
export function worstRegionByDistrict(regions: RegionMapItem[]): Map<string, RegionMapItem> {
  const worst = new Map<string, RegionMapItem>()
  regions.forEach((region) => {
    const prev = worst.get(region.district)
    if (!prev || GRADE_SEVERITY[region.grade] > GRADE_SEVERITY[prev.grade]) {
      worst.set(region.district, region)
    }
  })
  return worst
}

/**
 * regions/map 응답(상권 단위) → 구 단위 지도 마커.
 * API 가 좌표를 안 내려주므로 위치는 geojson 구 센트로이드를 쓰고,
 * 한 구에 상권이 여러 개면 가장 위험한(심각도 높은) 등급으로 대표한다.
 */
export function buildGuMarkers(
  regions: RegionMapItem[],
  centroids: Map<string, LatLngPoint>,
): MapMarker[] {
  const markers: MapMarker[] = []
  worstRegionByDistrict(regions).forEach((region, district) => {
    const point = centroids.get(district)
    if (!point) return // geojson 에 없는 구(비서울 등)는 표시하지 않음
    markers.push({
      id: district,
      lat: point.lat,
      lng: point.lng,
      title: district,
      caption: `${region.grade}등급`,
    })
  })
  return markers
}
