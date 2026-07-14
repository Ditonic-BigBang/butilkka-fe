import type { LatLngPoint } from './guCentroids'
import type { GuOutline } from '../model/useGuBoundaries'

// ray casting (even-odd) — 점에서 수평 반직선이 링 변과 홀수 번 교차하면 내부
function isPointInRing(point: LatLngPoint, ring: LatLngPoint[]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]
    const b = ring[j]
    const crosses =
      a.lng > point.lng !== b.lng > point.lng &&
      point.lat < ((b.lat - a.lat) * (point.lng - a.lng)) / (b.lng - a.lng) + a.lat
    if (crosses) inside = !inside
  }
  return inside
}

/** 좌표가 속한 자치구 이름 — 어떤 구 경계에도 없으면 null (지도에서 즐겨찾기 구 선택용) */
export function findDistrictAt(point: LatLngPoint, outlines: GuOutline[]): string | null {
  const hit = outlines.find((outline) => outline.rings.some((ring) => isPointInRing(point, ring)))
  return hit?.district ?? null
}
