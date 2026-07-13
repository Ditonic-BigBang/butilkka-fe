import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { regionKeys, fetchRegionMap } from '@/entities/region'
import { useSeoulGeoJson, computeGuCentroids } from '@/entities/district'
import type { MapMarker } from '@/widgets/district-map'
import { buildGuMarkers } from './regionMarkers'

const NO_MARKERS: MapMarker[] = []

/**
 * 지도 마커 데이터 소스 — `GET /regions/map`(등급) + 정적 geojson(좌표) 결합.
 * centroids 는 검색 결과 선택 시 구로 지도 이동할 때도 쓰인다.
 */
export function useRegionMarkers() {
  const { data: geoJson } = useSeoulGeoJson()
  const query = useQuery({ queryKey: regionKeys.map(), queryFn: () => fetchRegionMap() })

  const centroids = useMemo(() => (geoJson ? computeGuCentroids(geoJson) : null), [geoJson])
  const markers = useMemo(
    () => (query.data && centroids ? buildGuMarkers(query.data.regions, centroids) : NO_MARKERS),
    [query.data, centroids],
  )

  return { markers, centroids, quarter: query.data?.quarter }
}
