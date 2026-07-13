import { apiJson } from '@/shared/api/api'
import type {
  NotificationListResponse,
  NotificationReadResponse,
  NotificationSettings,
} from '../model/types'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
}

export const notificationSettingsKeys = {
  all: ['notification-settings'] as const,
  detail: () => [...notificationSettingsKeys.all, 'detail'] as const,
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

/** 알림 설정 조회 (GET /api/v1/users/me/notification-settings) */
export function getNotificationSettings(): Promise<NotificationSettings> {
  return apiJson<NotificationSettings>('/api/v1/users/me/notification-settings')
}

/**
 * 알림 설정 변경 (PATCH /api/v1/users/me/notification-settings).
 * 명세: 변경할 항목만 부분 전송 가능 — 응답은 변경된 설정 전체.
 */
export function patchNotificationSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  return apiJson<NotificationSettings>('/api/v1/users/me/notification-settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}
