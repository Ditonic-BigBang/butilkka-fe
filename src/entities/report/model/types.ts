export type ReportGrade = 'A' | 'B' | 'C' | 'D' | 'E'
export type ReportDeclineType = '성장' | '쇠퇴' | '유지'
/** 다음 분기 예측 추이 (2026-07-14 백엔드 추가) */
export type ReportPredictedTrend = '성장' | '유지' | '쇠퇴'
export type ReportCauseLevel = '높음' | '중간' | '낮음'
export type ReportRecommendation = '버티기' | '이동'

export interface ReportCause {
  title: string
  level: ReportCauseLevel
  description?: string
}

export interface ReportLeadingSignal {
  title: string
  description: string
}

export interface ReportSimilarCase {
  caseId: string
  regionCode: string
  regionName: string
  summary: string
  period: { startYear: number; endYear: number }
}

export interface ReportAlternativeRegion {
  /** 순위 (1부터 시작하며 응답 내에서 고유) */
  rank: number
  /** 5자리 자치구 코드 */
  regionCode: string
  regionName: string
  /** AI가 생성한 추천 문구. 과거 리포트는 비어 있을 수 있다. */
  aiMessage: string | null
  /** 점포 수 (개) */
  storeCount: number | null
  /** 분기 유동인구 합계 (명) */
  floatingPopulation: number | null
  /** 공실률 (%) */
  vacancy: number | null
  /** 지표 기준 분기 (YYYYQN) */
  baseDate: string | null
}

export interface ReportAiRecommendation {
  badgeType: string
  /** 과거 리포트에는 AI 추천 상세가 없을 수 있다. */
  title: string | null
  reasonTitle: string | null
  reasonDetail: string | null
}

export interface ReportResponse {
  reportId: number
  /**
   * 이번 요청에서 새로 생성된 리포트인지 (기존 리포트 조회면 false).
   * 생성 연출을 잘못 띄웠을 때 즉시 거두는 용도 — 구버전 응답 대비 optional.
   */
  generated?: boolean
  regionCode: string
  regionName: string
  categoryName: string
  districtName: string
  /** 분기 ("{year}Q{quarter}" 형식, 예: "2026Q2") */
  quarter: string
  grade: ReportGrade
  declineType: ReportDeclineType
  /** 백엔드 산출 상권 점수 0~100 (현재 FE 게이지는 등급별 고정 위치를 사용) */
  score: number
  /** AI 한 줄 브리핑 */
  briefing: string
  /** AI 종합 전망 (5~6줄) */
  aiOutlook: string
  /** 다음 분기 예측 추이 — quarterly_history(8분기 이력) 없으면 null (2026-07-14 백엔드 추가) */
  predictedTrend: ReportPredictedTrend | null
  /** 다음 분기 예측 등급 — quarterly_history 없으면 null (2026-07-14 백엔드 추가) */
  predictedNextGrade: ReportGrade | null
  causes: ReportCause[]
  leadingSignals: ReportLeadingSignal[]
  similarCases: ReportSimilarCase[]
  /** AI 의사결정 지원 */
  decision: { recommendation: ReportRecommendation; title: string; description: string }
  aiRecommendation: ReportAiRecommendation
  alternativeRegions: ReportAlternativeRegion[]
}

export interface ReportCaseDto {
  caseId: string
  regionCode: string
  regionName: string
  /** 사례 요약 (접힘 상태) */
  summary: string
  /** 사례 상세 — 펼침 시 AI 설명 */
  description: string
  /** 주요 키워드 (관련 태그, 없는 자리는 null/생략) */
  tag1?: string | null
  tag2?: string | null
  tag3?: string | null
  tag4?: string | null
  period: { startYear: number; endYear: number }
}

export interface ReportCasesResponse {
  totalCount: number
  cases: ReportCaseDto[]
}

export interface ReportHistoryItem {
  reportId: number
  quarter: string
  grade: ReportGrade
  briefing: string
  /** 자치구 코드(5자리) — 리포트는 구 단위 생성이라 다점포 구분 키. 구버전 응답 대비 optional */
  regionCode?: string
  /** 자치구명 (예: "마포구") — 목록에서 같은 분기 리포트를 구분하는 라벨 */
  regionName?: string
  /** 열람 여부 — 안 읽음은 목록에서 강조. 명세 미반영 선규격(백엔드 협의 필요), 없으면 읽음 취급 */
  isRead?: boolean
}

export interface ReportHistoryResponse {
  totalCount: number
  hasNext: boolean
  reports: ReportHistoryItem[]
}
