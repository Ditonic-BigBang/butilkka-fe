export type ReportGrade = 'A' | 'B' | 'C' | 'D' | 'E'
export type ReportDeclineType = '성장형' | '순환형' | '쇠퇴형' | '정체형'
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

/** 대체 상권 상세 지표 (Dropdown_L 펼침 스탯 타일 — 명세 미반영 선규격) */
export interface ReportRegionStat {
  /** 지표명 (예: "점포수") */
  label: string
  /** 표시 값 (예: "-4개", "+1,240") */
  value: string
  /** 증감 방향 — 화살표 색(▲빨강/▼파랑) */
  direction: 'UP' | 'DOWN'
  /** 화살표 옆 표기 (예: "감소"·"명/일"·"증가") */
  note: string
}

export interface ReportAlternativeRegion {
  /** 순위 — 실서버 미제공, 뷰에서 배열 순서로 대체 */
  rank?: number
  regionCode?: string
  /** 실서버가 스네이크케이스로 내려줌 — regionCode 통일 요청 중(백엔드) */
  region_code?: string
  /** 상권 이름 — 실서버 미제공(백엔드 추가 요청 중), 오기 전까진 코드로 폴백 표시 */
  regionName?: string
  reason: string
  /** 핵심 지표 한 줄 (예: "유동인구 +6.2%") — stats 없을 때 타일 1개로 폴백 */
  stat: string
  /** 펼침 스탯 타일 3개(점포수·유동인구·공실) — 명세 미반영 선규격(백엔드 협의 필요) */
  stats?: ReportRegionStat[]
  /** 지표 기준 시점 (예: "26.03") — 명세 미반영 선규격 */
  referenceDate?: string
}

export interface ReportResponse {
  reportId: number
  regionCode: string
  regionName: string
  categoryName: string
  districtName: string
  /** 분기 ("{year}Q{quarter}" 형식, 예: "2026Q2") */
  quarter: string
  grade: ReportGrade
  declineType: ReportDeclineType
  /** 상권 점수 0~100 (가로 막대그래프용) */
  score: number
  /** AI 한 줄 브리핑 */
  briefing: string
  /** AI 종합 전망 (5~6줄) */
  aiOutlook: string
  causes: ReportCause[]
  leadingSignals: ReportLeadingSignal[]
  similarCases: ReportSimilarCase[]
  /** AI 의사결정 지원 */
  decision: { recommendation: ReportRecommendation; title: string; description: string }
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
  /** 열람 여부 — 안 읽음은 목록에서 강조. 명세 미반영 선규격(백엔드 협의 필요), 없으면 읽음 취급 */
  isRead?: boolean
}

export interface ReportHistoryResponse {
  totalCount: number
  hasNext: boolean
  reports: ReportHistoryItem[]
}
