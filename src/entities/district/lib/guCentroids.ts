import type { SeoulGeoJson, SeoulFeature } from '../model/useSeoulGeoJson'

export type LatLngPoint = { lat: number; lng: number }

// 외곽 링만 추출 (구멍 링 제외) — Polygon 1개 / MultiPolygon 은 폴리곤별 1개
function getOuterRings(feature: SeoulFeature): number[][][] {
  const { geometry } = feature
  if (geometry.type === 'Polygon') {
    return [(geometry.coordinates as number[][][])[0]]
  }
  return (geometry.coordinates as number[][][][]).map((poly) => poly[0])
}

/**
 * 구 이름(sggnm) → 대표 좌표.
 * 행정동 외곽 링 센트로이드의 평균 — regions/map 이 좌표를 안 내려주므로
 * 구 단위 마커 위치는 정적 geojson 에서 계산한다.
 */
export function computeGuCentroids(geoJson: SeoulGeoJson): Map<string, LatLngPoint> {
  const accum = new Map<string, { latSum: number; lngSum: number; count: number }>()

  geoJson.features.forEach((feature) => {
    const guName = feature.properties.sggnm
    getOuterRings(feature).forEach((ring) => {
      if (ring.length === 0) return
      const lat = ring.reduce((s, p) => s + p[1], 0) / ring.length
      const lng = ring.reduce((s, p) => s + p[0], 0) / ring.length
      const acc = accum.get(guName) ?? { latSum: 0, lngSum: 0, count: 0 }
      acc.latSum += lat
      acc.lngSum += lng
      acc.count += 1
      accum.set(guName, acc)
    })
  })

  const centroids = new Map<string, LatLngPoint>()
  accum.forEach((acc, guName) => {
    centroids.set(guName, { lat: acc.latSum / acc.count, lng: acc.lngSum / acc.count })
  })
  return centroids
}
