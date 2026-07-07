import { apiJson } from '@/shared/api/api'
import type { NotificationListResponse, NotificationReadResponse } from '@/shared/api/types'

/** 알림 쿼리 키 팩토리 (TkDodo 패턴) */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
}

/**
 * 받은 알림 목록 조회 (GET /api/v1/notifications).
 * MVP 는 첫 페이지만 — 페이지네이션은 응답의 hasNext/offset·limit 로 후속 확장.
 */
export function getNotifications(): Promise<NotificationListResponse> {
  return apiJson<NotificationListResponse>('/api/v1/notifications')
}

/** 알림 읽음 처리 (PATCH /api/v1/notifications/{notificationId}) */
export function markNotificationRead(notificationId: number): Promise<NotificationReadResponse> {
  return apiJson<NotificationReadResponse>(`/api/v1/notifications/${notificationId}`, {
    method: 'PATCH',
  })
}
