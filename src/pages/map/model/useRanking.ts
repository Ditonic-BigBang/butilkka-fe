import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  regionKeys,
  fetchDeclineRanking,
  fetchMetricRanking,
  type RankingOrder,
  type RegionMetricRankingResponse,
  type RegionRankingResponse,
} from '@/entities/region'
import { DIRECTION_UI, METRIC_CONFIG, type MapCategory, type MetricConfig } from './mapCategory'
import { formatNumber } from '@/shared/lib/formatNumber'

/** 랭킹 바텀시트 행 뷰모델 — 값(등급 문자/표시 값) + 단위 */
export type RankingRow = {
  rank: number
  regionCode: string
  name: string
  /** 표시 값 (예: "E" · "789") */
  value: string
  /** 값 단위 (예: "등급" · "만원") */
  unit: string
  direction: 'up' | 'down' | 'same'
}

/** 랭킹 시트 뷰모델 — 행 목록 + (폐업률) 서울 전체 평균 영업 기간 */
export type RankingView = {
  rows: RankingRow[]
  averagePeriod?: { label: string; years: string }
}

function toGradeView(data: RegionRankingResponse): RankingView {
  return {
    rows: data.regions.map((r) => ({
      rank: r.rank,
      regionCode: r.regionCode,
      name: r.regionName,
      value: r.decline_grade,
      unit: '등급',
      direction: DIRECTION_UI[r.direction] ?? 'same',
    })),
  }
}

function toMetricView(data: RegionMetricRankingResponse, config: MetricConfig): RankingView {
  return {
    rows: data.regions.map((r) => ({
      rank: r.rank,
      regionCode: r.regionCode,
      name: r.regionName,
      value: formatNumber(config.toCompactValue(r.value)),
      unit: config.compactUnit,
      direction: DIRECTION_UI[r.direction] ?? 'same',
    })),
    averagePeriod:
      data.avgOperatingYears !== undefined
        ? { label: '서울 전체', years: String(data.avgOperatingYears) }
        : undefined,
  }
}

/**
 * 카테고리별 Top5 랭킹 — 등급은 `GET /regions/declineRanking`, 지표는 `GET /regions/metricRanking`.
 * 탭 전환(order 변경) 시 `keepPreviousData` 로 이전 목록을 유지해 깜빡임을 막는다.
 */
export function useRanking(category: MapCategory, order: RankingOrder, quarter?: string) {
  const metric = category === 'grade' ? null : category

  const gradeQuery = useQuery({
    queryKey: regionKeys.ranking(order, quarter),
    queryFn: ({ signal }) => fetchDeclineRanking(order, quarter, signal),
    select: toGradeView,
    placeholderData: keepPreviousData,
    enabled: metric === null,
  })
  const metricQuery = useQuery({
    queryKey: regionKeys.metricRanking(metric ?? 'rentRatio', order, quarter),
    queryFn: ({ signal }) => fetchMetricRanking(metric ?? 'rentRatio', order, quarter, signal),
    select: (data: RegionMetricRankingResponse) =>
      toMetricView(data, METRIC_CONFIG[metric ?? 'rentRatio']),
    placeholderData: keepPreviousData,
    enabled: metric !== null,
  })

  return metric ? metricQuery : gradeQuery
}
