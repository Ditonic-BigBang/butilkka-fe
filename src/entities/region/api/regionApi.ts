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
export function fetchRegionMap(quarter?: string, signal?: AbortSignal): Promise<RegionMapResponse> {
  const qs = quarter ? `?quarter=${encodeURIComponent(quarter)}` : ''
  return apiJson<RegionMapResponse>(`/api/v1/regions/map${qs}`, { signal })
}

/** GET /api/v1/regions/declineRanking — 쇠퇴 등급 Top5 (order: top 위험 높은 순 · bottom 안전한 순) */
export function fetchDeclineRanking(
  order: RankingOrder,
  quarter?: string,
  signal?: AbortSignal,
): Promise<RegionRankingResponse> {
  const params = new URLSearchParams({ order })
  if (quarter) params.set('quarter', quarter)
  return apiJson<RegionRankingResponse>(`/api/v1/regions/declineRanking?${params}`, { signal })
}

/**
 * GET /api/v1/regions/metricMap — 지표별 지도 값 (quarter 미지정 시 최신).
 * 선규격: 백엔드 미구현이라 MSW 목 전용 — 서버 반영 시 계약 재확인.
 */
export function fetchMetricMap(
  metric: MetricKey,
  quarter?: string,
  signal?: AbortSignal,
): Promise<RegionMetricMapResponse> {
  const params = new URLSearchParams({ metric })
  if (quarter) params.set('quarter', quarter)
  return apiJson<RegionMetricMapResponse>(`/api/v1/regions/metricMap?${params}`, { signal })
}

/**
 * GET /api/v1/regions/metricRanking — 지표별 Top5 (order: top 상위 · bottom 하위).
 * 선규격: 백엔드 미구현이라 MSW 목 전용 — 서버 반영 시 계약 재확인.
 */
export function fetchMetricRanking(
  metric: MetricKey,
  order: RankingOrder,
  quarter?: string,
  signal?: AbortSignal,
): Promise<RegionMetricRankingResponse> {
  const params = new URLSearchParams({ metric, order })
  if (quarter) params.set('quarter', quarter)
  return apiJson<RegionMetricRankingResponse>(`/api/v1/regions/metricRanking?${params}`, { signal })
}

/** GET /api/v1/regions/search — 상권 검색 자동완성 */
export function searchRegions(keyword: string, signal?: AbortSignal): Promise<RegionSearchItem[]> {
  return apiJson<RegionSearchItem[]>(
    `/api/v1/regions/search?keyword=${encodeURIComponent(keyword)}`,
    { signal },
  )
}

/**
 * GET /api/v1/districts/{regionCode} — 특정 상권 상세 (URI 명칭과 달리 path 는 상권코드).
 * quarter 는 향후 서버 지원을 위한 호환 파라미터다. 현재 응답은 최신 대표값과 전체 trend 를 반환하므로
 * 선택 분기 표시는 useRegionDetail 에서 trend 를 기준으로 계산한다.
 */
export function fetchRegionDetail(
  regionCode: string,
  quarter?: string,
  signal?: AbortSignal,
): Promise<RegionDetailResponse> {
  const qs = quarter ? `?quarter=${encodeURIComponent(quarter)}` : ''
  return apiJson<RegionDetailResponse>(`/api/v1/districts/${encodeURIComponent(regionCode)}${qs}`, {
    signal,
  })
}
