import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStore, storeKeys } from '@/entities/store'
import { useAuthStore } from '@/entities/session'

/**
 * 대표 가게 업종 변경 훅 (PATCH /api/v1/users/me/stores/{storeId}).
 * 성공 시 가게 목록을 무효화하고, 세션 user 를 갱신한다
 * (마이페이지 카드가 /users/me 의 대표 가게 업종을 쓰므로).
 */
export function useUpdateStoreCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, categoryCode }: { storeId: number; categoryCode: string }) =>
      updateStore(storeId, { categoryCode }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.myStores() })
      void useAuthStore
        .getState()
        .refreshUser()
        .catch(() => undefined)
    },
  })
}
