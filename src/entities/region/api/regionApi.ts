import { apiJson } from '@/shared/api/api'
import type {
  MetricKey,
  RankingOrder,
  RegionDetailResponse,
  RegionMapResponse,
  RegionMetricMapResponse,
  RegionMetricRankingResponse,
  RegionRankingResponse,
  RegionSearchItem,
} from '../model/types'

export const regionKeys = {
  all: ['region'] as const,
  map: (quarter?: string) => [...regionKeys.all, 'map', quarter ?? 'latest'] as const,
  ranking: (order: RankingOrder, quarter?: string) =>
    [...regionKeys.all, 'ranking', order, quarter ?? 'latest'] as const,
  metricMap: (metric: MetricKey, quarter?: string) =>
    [...regionKeys.all, 'metricMap', metric, quarter ?? 'latest'] as const,
  metricRanking: (metric: MetricKey, order: RankingOrder, quarter?: string) =>
    [...regionKeys.all, 'metricRanking', metric, order, quarter ?? 'latest'] as const,
  search: (keyword: string) => [...regionKeys.all, 'search', keyword] as const,
  detail: (regionCode: string, quarter?: string) =>
    [...regionKeys.all, 'detail', regionCode, quarter ?? 'latest'] as const,
}

/** GET /api/v1/regions/map — 상권별 쇠퇴등급 (quarter 미지정 시 최신) */
export function fetchRegionMap(quarter?: string): Promise<RegionMapResponse> {
  const qs = quarter ? `?quarter=${encodeURIComponent(quarter)}` : ''
  return apiJson<RegionMapResponse>(`/api/v1/regions/map${qs}`)
}

/** GET /api/v1/regions/declineRanking — 쇠퇴 등급 Top5 (order: top 위험 높은 순 · bottom 안전한 순) */
export function fetchDeclineRanking(
  order: RankingOrder,
  quarter?: string,
): Promise<RegionRankingResponse> {
  const params = new URLSearchParams({ order })
  if (quarter) params.set('quarter', quarter)
  return apiJson<RegionRankingResponse>(`/api/v1/regions/declineRanking?${params}`)
}

/**
 * GET /api/v1/regions/metricMap — 지표별 지도 값 (quarter 미지정 시 최신).
 * 선규격: 백엔드 미구현이라 MSW 목 전용 — 서버 반영 시 계약 재확인.
 */
export function fetchMetricMap(
  metric: MetricKey,
  quarter?: string,
): Promise<RegionMetricMapResponse> {
  const params = new URLSearchParams({ metric })
  if (quarter) params.set('quarter', quarter)
  return apiJson<RegionMetricMapResponse>(`/api/v1/regions/metricMap?${params}`)
}

/**
 * GET /api/v1/regions/metricRanking — 지표별 Top5 (order: top 상위 · bottom 하위).
 * 선규격: 백엔드 미구현이라 MSW 목 전용 — 서버 반영 시 계약 재확인.
 */
export function fetchMetricRanking(
  metric: MetricKey,
  order: RankingOrder,
  quarter?: string,
): Promise<RegionMetricRankingResponse> {
  const params = new URLSearchParams({ metric, order })
  if (quarter) params.set('quarter', quarter)
  return apiJson<RegionMetricRankingResponse>(`/api/v1/regions/metricRanking?${params}`)
}

/** GET /api/v1/regions/search — 상권 검색 자동완성 */
export function searchRegions(keyword: string): Promise<RegionSearchItem[]> {
  return apiJson<RegionSearchItem[]>(
    `/api/v1/regions/search?keyword=${encodeURIComponent(keyword)}`,
  )
}

/**
 * GET /api/v1/districts/{regionCode} — 특정 상권 상세 (URI 명칭과 달리 path 는 상권코드).
 * quarter 는 FE 선규격 파라미터(스웨거 미정의) — 조회 분기 기준 상세, 미지정 시 최신.
 */
export function fetchRegionDetail(
  regionCode: string,
  quarter?: string,
): Promise<RegionDetailResponse> {
  const qs = quarter ? `?quarter=${encodeURIComponent(quarter)}` : ''
  return apiJson<RegionDetailResponse>(`/api/v1/districts/${encodeURIComponent(regionCode)}${qs}`)
}
