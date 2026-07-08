import { apiJson } from '@/shared/api/api'
import type { NotificationSettings } from '@/shared/api/types'

/** 알림 설정 쿼리 키 팩토리 (TkDodo 패턴) */
export const notificationSettingsKeys = {
  all: ['notification-settings'] as const,
  detail: () => [...notificationSettingsKeys.all, 'detail'] as const,
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
