export type LatLngPoint = { lat: number; lng: number }

type DistrictRings = {
  district: string
  rings: LatLngPoint[][]
}

type RingCentroid = LatLngPoint & { weight: number }

function getRingCentroid(ring: LatLngPoint[]): RingCentroid | null {
  if (ring.length === 0) return null

  let twiceArea = 0
  let lngSum = 0
  let latSum = 0
  // 서울 좌표(약 127, 37)를 그대로 shoelace에 넣으면 작은 폴리곤에서 상쇄 오차가 커진다.
  // 첫 점을 원점으로 옮겨 면적과 중심점을 안정적으로 계산한다.
  const origin = ring[0]

  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index]
    const next = ring[(index + 1) % ring.length]
    const currentLng = current.lng - origin.lng
    const currentLat = current.lat - origin.lat
    const nextLng = next.lng - origin.lng
    const nextLat = next.lat - origin.lat
    const cross = currentLng * nextLat - nextLng * currentLat
    twiceArea += cross
    lngSum += (currentLng + nextLng) * cross
    latSum += (currentLat + nextLat) * cross
  }

  // 손상됐거나 면적이 0인 링도 지도 이동이 가능하도록 꼭짓점 평균으로 폴백한다.
  if (Math.abs(twiceArea) < Number.EPSILON) {
    return {
      lat: ring.reduce((sum, point) => sum + point.lat, 0) / ring.length,
      lng: ring.reduce((sum, point) => sum + point.lng, 0) / ring.length,
      weight: 1,
    }
  }

  return {
    lat: origin.lat + latSum / (3 * twiceArea),
    lng: origin.lng + lngSum / (3 * twiceArea),
    weight: Math.abs(twiceArea / 2),
  }
}

/**
 * 구 이름(sggnm) → 대표 좌표.
 * 25개 자치구 외곽 링의 면적 가중 중심점 — regions/map 이 좌표를 안 내려주므로
 * 구 단위 마커 위치는 경계 표시와 같은 56KB geojson 에서 계산한다.
 */
export function computeGuCentroids(outlines: DistrictRings[]): Map<string, LatLngPoint> {
  const centroids = new Map<string, LatLngPoint>()

  outlines.forEach(({ district, rings }) => {
    const ringCentroids = rings.map(getRingCentroid).filter((value) => value !== null)
    const totalWeight = ringCentroids.reduce((sum, point) => sum + point.weight, 0)
    if (totalWeight === 0) return

    centroids.set(district, {
      lat: ringCentroids.reduce((sum, point) => sum + point.lat * point.weight, 0) / totalWeight,
      lng: ringCentroids.reduce((sum, point) => sum + point.lng * point.weight, 0) / totalWeight,
    })
  })

  return centroids
}
