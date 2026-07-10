import { useQuery } from '@tanstack/react-query'
import { fetchReportHistory, reportKeys } from '@/entities/report'
import { formatQuarter } from '@/shared/lib/quarter'
import type { ReportHistoryItem } from '@/shared/api/types'

/** 정렬 순서 — 최신순(기본)/오래된순 */
export type SortOrder = 'latest' | 'oldest'

export const SORT_LABELS: Record<SortOrder, string> = {
  latest: '최신순',
  oldest: '오래된순',
}

/** 리포트 히스토리 목록 화면의 행 (뷰모델) */
export type ReportHistoryRow = {
  reportId: number
  /** 분기 표시 (예: "2026년 1분기") */
  quarter: string
  /** 카드 제목 (예: "2026년 1분기 분석 리포트") */
  title: string
  /** 요약 (briefing, 여러 줄은 \n) */
  summary: string
  read: boolean
}

function toRow(item: ReportHistoryItem): ReportHistoryRow {
  const quarter = formatQuarter(item.quarter)
  return {
    reportId: item.reportId,
    quarter,
    title: `${quarter} 분석 리포트`,
    summary: item.briefing,
    // isRead 는 선규격 — 백엔드가 안 주면 읽음 취급(강조 없음)
    read: item.isRead ?? true,
  }
}

/**
 * 리포트 히스토리 목록 데이터 소스.
 * `GET /api/v1/reportsHistory` 응답을 정렬 순서에 맞춰 행 뷰모델로 변환한다.
 * 정렬은 클라이언트에서 quarter("YYYYQN") 문자열 비교로 처리.
 */
export function useReportHistoryList(order: SortOrder) {
  return useQuery({
    queryKey: reportKeys.history(),
    queryFn: fetchReportHistory,
    select: (d) =>
      d.reports
        .toSorted((a, b) =>
          order === 'latest'
            ? b.quarter.localeCompare(a.quarter)
            : a.quarter.localeCompare(b.quarter),
        )
        .map(toRow),
  })
}
