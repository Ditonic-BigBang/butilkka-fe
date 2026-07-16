import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { regionKeys, fetchRegionMap, fetchMetricMap } from '@/entities/region'
import type { LatLngPoint } from '@/entities/district'
import type { MapMarker } from '@/widgets/district-map'
import {
  buildGuMarkers,
  buildMetricGuMarkers,
  topValueRegionByDistrict,
  worstRegionByDistrict,
} from './regionMarkers'
import { METRIC_CONFIG, type MapCategory } from './mapCategory'

const NO_MARKERS: MapMarker[] = []

/**
 * 지도 마커 데이터 소스 — 카테고리별 API(등급 regions/map · 지표 regions/metricMap) + 정적 geojson(좌표) 결합.
 * centroids 는 검색 결과 선택 시 구로 지도 이동할 때도 쓰인다.
 * quarter 미지정이면 최신 분기 — 분기/카테고리 전환 시엔 이전 마커를 유지해 깜빡임을 막는다.
 */
export function useRegionMarkers(
  category: MapCategory,
  quarter: string | undefined,
  centroids: Map<string, LatLngPoint> | null,
) {
  const metric = category === 'grade' ? null : category

  const gradeQuery = useQuery({
    queryKey: regionKeys.map(quarter),
    queryFn: ({ signal }) => fetchRegionMap(quarter, signal),
    placeholderData: keepPreviousData,
    enabled: metric === null,
  })
  const metricQuery = useQuery({
    queryKey: regionKeys.metricMap(metric ?? 'rentRatio', quarter),
    queryFn: ({ signal }) => fetchMetricMap(metric ?? 'rentRatio', quarter, signal),
    placeholderData: keepPreviousData,
    enabled: metric !== null,
  })

  const markers = useMemo(() => {
    if (!centroids) return NO_MARKERS
    if (metric) {
      return metricQuery.data
        ? buildMetricGuMarkers(metricQuery.data.regions, centroids, METRIC_CONFIG[metric])
        : NO_MARKERS
    }
    return gradeQuery.data ? buildGuMarkers(gradeQuery.data.regions, centroids) : NO_MARKERS
  }, [metric, gradeQuery.data, metricQuery.data, centroids])

  // 구 → 대표 상권(등급: 최악 등급 · 지표: 최댓값) — 마커/랭킹에서 구 선택 시 상세 조회할 regionCode
  const regionByDistrict = useMemo(() => {
    if (metric) return metricQuery.data ? topValueRegionByDistrict(metricQuery.data.regions) : null
    return gradeQuery.data ? worstRegionByDistrict(gradeQuery.data.regions) : null
  }, [metric, gradeQuery.data, metricQuery.data])

  return {
    markers,
    regionByDistrict,
    quarter: metric ? metricQuery.data?.quarter : gradeQuery.data?.quarter,
  }
}
