// 백엔드 응답 DTO (API명세서 V3). envelope 의 `data` 부분 형태 — 실서버/MSW 공통 계약.
// UI 뷰모델(HomeDashboard, NotificationView 등)은 각 페이지 model 에서 이 DTO 를 매핑해 만든다.

// ── 홈 대시보드 (GET /api/v1/dashboard) ──────────────────────────
export interface MetricSeries {
  /** 증감 방향 */
  direction: 'UP' | 'DOWN'
  /** 변화율(%) */
  delta: number
  /** 절대 증감량 (유동인구=명, 점포/폐업=개) */
  gap: number
  /** 최근 3분기 추이 */
  points: { quarter: string; value: number }[]
}

export interface DashboardResponse {
  store: { regionCode: string; regionName: string; categoryName: string; district: string }
  grade: {
    /** 이번 분기 등급 A~E */
    current: string
    /** 지난 분기 등급 A~E */
    previous: string
    /** 게이지 수치 0~100 */
    gaugeValue: number
  }
  briefing: string
  metrics: { footTraffic: MetricSeries; storeCount: MetricSeries; closureRate: MetricSeries }
}

// ── AI 리포트 (GET /api/v1/reports/latest · /api/v1/reports/{reportId}) ──
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
  rank: number
  regionCode: string
  regionName: string
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

// ── 리포트 히스토리 (GET /api/v1/reportsHistory) ──────────────────
export interface ReportHistoryItem {
  reportId: number
  quarter: string
  grade: ReportGrade
  briefing: string
}

export interface ReportHistoryResponse {
  totalCount: number
  hasNext: boolean
  reports: ReportHistoryItem[]
}

// ── 알림 설정 (GET/PATCH /api/v1/users/me/notification-settings) ──
export interface NotificationSettings {
  /** SMS(카카오톡) 알림 연동 */
  smsAlert: boolean
  /** 분기별 자동 리포트 */
  autoReport: boolean
  /** 이상(비상) 신호 즉시 알림 */
  urgentAlert: boolean
}

// ── 알림 (GET /api/v1/notifications, PATCH …/{id}) ────────────────
export type NotificationCategory = 'EMERGENCY' | 'REPORT' | 'SYSTEM'

export interface NotificationDto {
  notificationId: number
  category: NotificationCategory
  title: string
  content: string
  isRead: boolean
  /** 발송 일시 (ISO 8601, 오프셋 없음 — 예: "2026-06-20T09:00:00") */
  sentAt: string
}

export interface NotificationListResponse {
  totalCount: number
  hasNext: boolean
  notifications: NotificationDto[]
}

export interface NotificationReadResponse {
  notificationId: number
  isRead: boolean
}
