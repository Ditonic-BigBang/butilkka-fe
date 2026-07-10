import { useQuery } from '@tanstack/react-query'
import { fetchLatestReport, fetchReportHistory, reportKeys } from '@/entities/report'
import { toReportView } from '@/widgets/report-overview'
import type { ReportHistoryResponse } from '@/shared/api/types'

/**
 * 최신 분기 리포트 데이터 소스.
 * `GET /api/v1/reports/latest` 응답(DTO)을 `select` 로 본문 뷰모델(ReportView)로 변환한다.
 */
export function useLatestReport() {
  return useQuery({
    queryKey: reportKeys.latest(),
    queryFn: fetchLatestReport,
    select: toReportView,
  })
}

/** 리포트 히스토리 — 이전 리포트 이동 버튼(분기·등급)에 쓴다. 최신 분기부터 내림차순 정렬. */
export function useReportHistory() {
  return useQuery({
    queryKey: reportKeys.history(),
    queryFn: fetchReportHistory,
    select: (d: ReportHistoryResponse) =>
      d.reports.toSorted((a, b) => b.quarter.localeCompare(a.quarter)),
  })
}
