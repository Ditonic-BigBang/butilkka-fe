import { useQuery } from '@tanstack/react-query'
import { fetchReport, reportKeys } from '@/entities/report'
import { toReportView } from '@/widgets/report-overview'

/**
 * 특정(지난) 분기 리포트 데이터 소스.
 * `GET /api/v1/reports/{reportId}` 응답(구조는 latest 와 동일)을 본문 뷰모델로 변환한다.
 * 잘못된 id 는 서버 404(존재하지 않는 리포트) → 에러 상태로 흐른다.
 */
export function useReportDetail(reportId: number) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => fetchReport(reportId),
    select: toReportView,
  })
}
