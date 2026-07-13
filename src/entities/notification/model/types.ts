export interface NotificationSettings {
  /** SMS(카카오톡) 알림 연동 */
  smsAlert: boolean
  /** 분기별 자동 리포트 */
  autoReport: boolean
  /** 이상(비상) 신호 즉시 알림 */
  urgentAlert: boolean
}

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
