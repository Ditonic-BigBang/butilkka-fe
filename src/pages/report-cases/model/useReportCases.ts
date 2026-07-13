import { useQuery } from '@tanstack/react-query'
import { fetchReportCases, reportKeys, type ReportCaseDto } from '@/entities/report'

/** 정렬 순서 — 기간순(기본, 최근 기간 먼저)/추천순(서버 순서 = 유사도) */
export type CaseSortOrder = 'period' | 'recommended'

export const CASE_SORT_LABELS: Record<CaseSortOrder, string> = {
  period: '기간순',
  recommended: '추천순',
}

/** 유사 사례 전체보기 화면의 카드 (뷰모델) */
export type ReportCaseView = {
  caseId: string
  region: string
  /** 기간 표시 (예: "2018~2020") */
  period: string
  summary: string
  /** 펼침 시 AI 설명 */
  explanation: string
  tags: string[]
}

function toCaseView(c: ReportCaseDto): ReportCaseView {
  return {
    caseId: c.caseId,
    region: c.regionName,
    period: `${c.period.startYear}~${c.period.endYear}`,
    summary: c.summary,
    explanation: c.description,
    // tag1~4 는 빈 자리가 있을 수 있어 값 있는 것만
    tags: [c.tag1, c.tag2, c.tag3, c.tag4].filter((tag): tag is string => Boolean(tag)),
  }
}

// 기간순: 최근에 끝난 사례 먼저 (동률이면 최근 시작 먼저)
function byPeriod(a: ReportCaseDto, b: ReportCaseDto) {
  return b.period.endYear - a.period.endYear || b.period.startYear - a.period.startYear
}

/**
 * 유사 사례 전체 목록 데이터 소스.
 * `GET /api/v1/reports/{reportId}/cases` 응답을 정렬 순서에 맞춰 카드 뷰모델로 변환한다.
 * 추천순은 서버가 내려준 순서(유사도) 그대로, 기간순만 클라이언트 정렬.
 */
export function useReportCases(reportId: number, order: CaseSortOrder) {
  return useQuery({
    queryKey: reportKeys.cases(reportId),
    queryFn: () => fetchReportCases(reportId),
    select: (d) => (order === 'period' ? d.cases.toSorted(byPeriod) : d.cases).map(toCaseView),
  })
}
