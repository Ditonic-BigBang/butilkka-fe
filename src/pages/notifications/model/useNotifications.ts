import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationCategory } from '@/shared/api/types'
import { getNotifications, markNotificationRead, notificationKeys } from './notificationApi'
import { categoryLabel, formatSentAt } from '../lib/notificationFormat'

/** 화면에서 쓰는 알림 뷰모델 (NotificationItem props 로 바로 매핑) */
export type NotificationView = {
  id: number
  category: string
  date: string
  title: string
  action?: string
  read: boolean
}

// 상세(리포트 등)로 이동 가능한 카테고리 → "보러가기 →" 액션 노출
const ACTIONABLE = new Set<NotificationCategory>(['REPORT', 'EMERGENCY'])

/**
 * 알림 목록 조회 훅.
 * `GET /api/v1/notifications` 응답(DTO)을 `select` 로 화면 뷰모델로 변환한다
 * (카테고리 라벨·상대시간 포맷·액션 유도).
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
    select: (res): NotificationView[] =>
      res.notifications.map((n) => ({
        id: n.notificationId,
        category: categoryLabel(n.category),
        date: formatSentAt(n.sentAt),
        title: n.title,
        action: ACTIONABLE.has(n.category) ? '보러가기 →' : undefined,
        read: n.isRead,
      })),
  })
}

/** 알림 읽음 처리 훅 — 성공 시 목록 무효화로 재조회(읽음 반영) */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list() }),
  })
}
