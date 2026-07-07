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
