import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStore, storeKeys, type UpdateStorePayload } from '@/entities/store'
import { useAuthStore } from '@/entities/session'
import { invalidatePrimaryStoreViews } from '@/entities/report'

/**
 * 가게 수정 훅 (PATCH /api/v1/users/me/stores/{storeId}).
 * 성공하면 가게 목록을 무효화하고, 세션 사용자도 갱신한다
 * (마이페이지 카드가 /users/me 의 대표 가게 요약을 쓰므로).
 * 리포트·대시보드는 대표 가게 기준이라 캐시도 함께 정리한다 — 생성 여부는
 * 리포트 화면이 새로 받은 히스토리로 판별하므로 여기서 미리 알릴 필요는 없다.
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
      invalidatePrimaryStoreViews(queryClient)
    },
  })
}
