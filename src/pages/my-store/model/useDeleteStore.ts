import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteStore, storeKeys, type MyStore } from '@/entities/store'

/** 일반 가게 삭제 — 성공 즉시 목록에서 제거하고 서버 목록을 다시 확인한다. */
export function useDeleteStore() {
  const queryClient = useQueryClient()
  const key = storeKeys.myStores()

  return useMutation({
    mutationFn: deleteStore,
    onSuccess: (_data, storeId) => {
      queryClient.setQueryData<MyStore[]>(key, (stores) =>
        stores?.filter((store) => store.storeId !== storeId),
      )
      void queryClient.invalidateQueries({ queryKey: key })
    },
  })
}
