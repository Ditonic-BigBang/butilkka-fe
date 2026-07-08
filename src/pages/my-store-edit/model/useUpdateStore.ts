import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStore, storeKeys, type UpdateStorePayload } from '@/entities/store'
import { useAuthStore } from '@/entities/session'

/**
 * 가게 수정 훅 (PATCH /api/v1/users/me/stores/{storeId}).
 * 성공하면 가게 목록을 무효화하고, 세션 사용자도 갱신한다
 * (마이페이지 카드가 /users/me 의 대표 가게 요약을 쓰므로).
 */
export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, payload }: { storeId: number; payload: UpdateStorePayload }) =>
      updateStore(storeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.myStores() })
      // refreshUser: status 를 건드리지 않는 조용한 갱신 (restoreSession 은 SessionGate 스플래시 유발)
      void useAuthStore
        .getState()
        .refreshUser()
        .catch(() => undefined)
    },
  })
}
