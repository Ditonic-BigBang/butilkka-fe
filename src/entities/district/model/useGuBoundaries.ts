import { queryOptions, useQuery } from '@tanstack/react-query'
import { computeGuCentroids, type LatLngPoint } from '../lib/guCentroids'

// public/seoul-gu.geojson — 서울 자치구 경계 (southkorea/seoul-maps kostat 2013 simple)
export interface GuFeatureProperties {
  code: string
  name: string // "종로구"
  name_eng: string
  base_year: string
}

export interface GuFeature {
  type: 'Feature'
  properties: GuFeatureProperties
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface GuGeoJson {
  type: 'FeatureCollection'
  features: GuFeature[]
}

/** 구 경계 폴리곤 — 지도에 그릴 외곽 링 좌표 묶음 */
export type GuOutline = { district: string; rings: LatLngPoint[][] }

export type GuGeometry = {
  boundaries: GuOutline[]
  centroids: Map<string, LatLngPoint>
}

/** GeoJSON 좌표([lng, lat]) → 지도 폴리곤용 외곽 링 목록 (구멍 링 제외) */
export function toGuOutlines(geoJson: GuGeoJson): GuOutline[] {
  return geoJson.features.map((feature) => {
    const { geometry } = feature
    const outerRings =
      geometry.type === 'Polygon'
        ? [(geometry.coordinates as number[][][])[0]]
        : (geometry.coordinates as number[][][][]).map((poly) => poly[0])
    return {
      district: feature.properties.name,
      rings: outerRings.map((ring) => ring.map(([lng, lat]) => ({ lat, lng }))),
    }
  })
}

export function toGuGeometry(geoJson: GuGeoJson): GuGeometry {
  const boundaries = toGuOutlines(geoJson)
  return { boundaries, centroids: computeGuCentroids(boundaries) }
}

async function fetchGuGeometry({ signal }: { signal: AbortSignal }): Promise<GuGeometry> {
  const response = await fetch(`${import.meta.env.BASE_URL}seoul-gu.geojson`, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return toGuGeometry((await response.json()) as GuGeoJson)
}

/** 경계와 중심점을 같은 56KB 정적 geometry에서 한 번만 계산하고 세션 동안 유지한다. */
export const guGeometryQueryOptions = queryOptions({
  queryKey: ['district', 'gu-geometry'] as const,
  queryFn: fetchGuGeometry,
  staleTime: Infinity,
  gcTime: Infinity,
})

export function useGuGeometry() {
  const query = useQuery(guGeometryQueryOptions)

  return {
    ...query,
    boundaries: query.data?.boundaries ?? null,
    centroids: query.data?.centroids ?? null,
  }
}
