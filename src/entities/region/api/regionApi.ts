import { apiJson } from '@/shared/api/api'
import type {
  RankingOrder,
  RegionMapResponse,
  RegionRankingResponse,
  RegionSearchItem,
} from '../model/types'

export const regionKeys = {
  all: ['region'] as const,
  map: (quarter?: string) => [...regionKeys.all, 'map', quarter ?? 'latest'] as const,
  ranking: (order: RankingOrder, quarter?: string) =>
    [...regionKeys.all, 'ranking', order, quarter ?? 'latest'] as const,
  search: (keyword: string) => [...regionKeys.all, 'search', keyword] as const,
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

/** GET /api/v1/regions/search — 상권 검색 자동완성 */
export function searchRegions(keyword: string): Promise<RegionSearchItem[]> {
  return apiJson<RegionSearchItem[]>(
    `/api/v1/regions/search?keyword=${encodeURIComponent(keyword)}`,
  )
}
