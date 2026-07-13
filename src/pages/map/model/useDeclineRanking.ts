import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  regionKeys,
  fetchDeclineRanking,
  type RankingOrder,
  type RegionGrade,
  type RegionRankingResponse,
} from '@/entities/region'

/** 랭킹 바텀시트 행 뷰모델 */
export type RankingRow = {
  rank: number
  regionCode: string
  name: string
  grade: RegionGrade
  direction: 'up' | 'down' | 'same'
}

// 서버 방향(UP/DOWN/FLAT) → ChangeIndicator 방향
const DIRECTION_UI = { UP: 'up', DOWN: 'down', FLAT: 'same' } as const

function toRows(data: RegionRankingResponse): RankingRow[] {
  return data.regions.map((r) => ({
    rank: r.rank,
    regionCode: r.regionCode,
    name: r.regionName,
    grade: r.decline_grade,
    direction: DIRECTION_UI[r.direction] ?? 'same',
  }))
}

/**
 * 쇠퇴 등급 Top5 — `GET /regions/declineRanking`.
 * 탭 전환(order 변경) 시 `keepPreviousData` 로 이전 목록을 유지해 깜빡임을 막는다.
 */
export function useDeclineRanking(order: RankingOrder, quarter?: string) {
  return useQuery({
    queryKey: regionKeys.ranking(order, quarter),
    queryFn: () => fetchDeclineRanking(order, quarter),
    select: toRows,
    placeholderData: keepPreviousData,
  })
}
