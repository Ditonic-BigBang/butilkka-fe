import { apiJson } from '@/shared/api/api'
import type { ReportCasesResponse, ReportHistoryResponse, ReportResponse } from './types'

/**
 * reports 쿼리 키 팩토리 (TkDodo 패턴).
 * 리포트 화면(pages/report)과 히스토리 화면(pages/report-history)이 함께 쓰므로
 * 페이지가 아닌 report 엔티티가 소유한다. select(뷰모델 매핑)는 각 페이지 model 에서.
 */
export const reportKeys = {
  all: ['reports'] as const,
  latest: () => [...reportKeys.all, 'latest'] as const,
  detail: (reportId: number) => [...reportKeys.all, 'detail', reportId] as const,
  cases: (reportId: number) => [...reportKeys.all, 'cases', reportId] as const,
  history: () => [...reportKeys.all, 'history'] as const,
}

/** GET /api/v1/reports/latest (명세: envelope.data = ReportResponse) */
export function fetchLatestReport(): Promise<ReportResponse> {
  return apiJson<ReportResponse>('/api/v1/reports/latest')
}

/** GET /api/v1/reports/{reportId} — 특정(지난) 분기 리포트, 응답 구조는 latest 와 동일 */
export function fetchReport(reportId: number): Promise<ReportResponse> {
  return apiJson<ReportResponse>(`/api/v1/reports/${reportId}`)
}

/** GET /api/v1/reports/{reportId}/cases — 유사 상권 사례 전체 목록 */
export function fetchReportCases(reportId: number): Promise<ReportCasesResponse> {
  return apiJson<ReportCasesResponse>(`/api/v1/reports/${reportId}/cases`)
}

/**
 * GET /api/v1/reportsHistory
 * 서버 기본값은 limit=20 인데 목록·이전 리포트 조회 모두 전체를 client 에서 정렬·필터하므로
 * 한 번에 넉넉히 받는다(무한 스크롤 없음). 100건을 넘길 일이 생기면 페이지네이션 도입.
 */
export function fetchReportHistory(): Promise<ReportHistoryResponse> {
  return apiJson<ReportHistoryResponse>('/api/v1/reportsHistory?offset=0&limit=100')
}
