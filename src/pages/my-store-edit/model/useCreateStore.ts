import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createStore, storeKeys, type CreateStorePayload } from '@/entities/store'

/**
 * 가게 추가 훅 (POST /api/v1/users/me/stores).
 * 성공 시 가게 목록을 무효화 → 목록 맨 뒤에 새 가게가 반영된다.
 * (대표 가게가 아니므로 세션 user.store 요약은 갱신 불필요)
 */
export function useCreateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateStorePayload) => createStore(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.myStores() }),
  })
}
