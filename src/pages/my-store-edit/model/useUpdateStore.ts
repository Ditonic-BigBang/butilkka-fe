import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStore, storeKeys, type UpdateStorePayload } from '@/entities/store'
import { useAuthStore } from '@/entities/session'
import { invalidatePrimaryStoreViews, markReportGenerating } from '@/entities/report'

/**
 * 가게 수정 훅 (PATCH /api/v1/users/me/stores/{storeId}).
 * 성공하면 가게 목록을 무효화하고, 세션 사용자도 갱신한다
 * (마이페이지 카드가 /users/me 의 대표 가게 요약을 쓰므로).
 * 리포트·대시보드는 대표 가게 기준이라 캐시도 함께 정리한다.
 */
export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: number
      payload: UpdateStorePayload
      /** 수정 전 자치구 코드 — 구가 바뀌었는지 비교용 (리포트는 구 단위 생성) */
      prevRegionCode?: string
    }) => updateStore(storeId, payload),
    onSuccess: (_data, { payload, prevRegionCode }) => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.myStores() })
      // refreshUser: status 를 건드리지 않는 조용한 갱신 (restoreSession 은 SessionGate 스플래시 유발)
      void useAuthStore
        .getState()
        .refreshUser()
        .catch(() => undefined)
      // 구가 그대로여도 정리한다 — 상권코드 재매핑이 늦게 끝나 비교가 빗나가는 경우까지 덮는다
      invalidatePrimaryStoreViews(queryClient)
      // 다른 구로 이동이면 다음 리포트 조회는 생성(10~15초) — 진입 즉시 연출 예고
      if (prevRegionCode && payload.regionCode !== prevRegionCode) markReportGenerating()
    },
  })
}
