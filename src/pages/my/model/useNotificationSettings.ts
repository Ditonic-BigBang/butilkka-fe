import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationSettings } from '@/shared/api/types'
import {
  getNotificationSettings,
  patchNotificationSettings,
  notificationSettingsKeys,
} from './notificationSettingsApi'

/** 알림 설정 조회 훅 (GET /api/v1/users/me/notification-settings) */
export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationSettingsKeys.detail(),
    queryFn: getNotificationSettings,
  })
}

/**
 * 알림 설정 변경 훅 — 토글이 즉각 반응하도록 낙관적 업데이트, 실패 시 롤백.
 * 응답이 설정 전체이므로 settled 후 재조회로 서버 상태와 동기화한다.
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  const key = notificationSettingsKeys.detail()

  return useMutation({
    mutationFn: patchNotificationSettings,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<NotificationSettings>(key)
      if (previous) queryClient.setQueryData(key, { ...previous, ...patch })
      return { previous }
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
