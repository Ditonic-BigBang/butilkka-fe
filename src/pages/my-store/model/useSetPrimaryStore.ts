import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setPrimaryStore, storeKeys, type MyStore } from '@/entities/store'
import { useAuthStore } from '@/entities/session'
import { invalidatePrimaryStoreViews } from '@/entities/report'

/**
 * 대표 가게 지정 훅 (PATCH /api/v1/users/me/stores/{storeId}) — 목록 행 탭 시 호출.
 * 칩·정렬이 즉시 반응하도록 낙관적 업데이트, 실패 시 롤백.
 * 성공하면 세션 사용자도 갱신한다(마이페이지 카드가 /users/me 의 대표 가게 요약을 쓰므로).
 * 리포트·대시보드는 대표 가게 기준이라 캐시도 정리한다 — 대표 가게가 바뀌면 두 화면이
 * 가리키는 가게 자체가 달라지므로, 남겨두면 옛 가게 화면을 보이다 조용히 갈아끼워진다.
 */
export function useSetPrimaryStore() {
  const queryClient = useQueryClient()
  const key = storeKeys.myStores()

  return useMutation({
    mutationFn: setPrimaryStore,
    onMutate: async (storeId) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<MyStore[]>(key)
      if (previous) {
        queryClient.setQueryData(
          key,
          previous.map((s) => ({ ...s, isPrimary: s.storeId === storeId })),
        )
      }
      return { previous }
    },
    onError: (_error, _storeId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: () => {
      // refreshUser: status 를 건드리지 않는 조용한 갱신 (restoreSession 은 SessionGate 스플래시 유발)
      void useAuthStore
        .getState()
        .refreshUser()
        .catch(() => undefined)
      invalidatePrimaryStoreViews(queryClient)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
