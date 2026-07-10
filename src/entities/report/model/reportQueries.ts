import { apiJson } from '@/shared/api/api'
import type { ReportHistoryResponse, ReportResponse } from '@/shared/api/types'

/**
 * reports 쿼리 키 팩토리 (TkDodo 패턴).
 * 리포트 화면(pages/report)과 히스토리 화면(pages/report-history)이 함께 쓰므로
 * 페이지가 아닌 report 엔티티가 소유한다. select(뷰모델 매핑)는 각 페이지 model 에서.
 */
export const reportKeys = {
  all: ['reports'] as const,
  latest: () => [...reportKeys.all, 'latest'] as const,
  history: () => [...reportKeys.all, 'history'] as const,
}

/** GET /api/v1/reports/latest (명세: envelope.data = ReportResponse) */
export function fetchLatestReport(): Promise<ReportResponse> {
  return apiJson<ReportResponse>('/api/v1/reports/latest')
}

/** GET /api/v1/reportsHistory */
export function fetchReportHistory(): Promise<ReportHistoryResponse> {
  return apiJson<ReportHistoryResponse>('/api/v1/reportsHistory')
}
