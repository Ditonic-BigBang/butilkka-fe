import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStore, storeKeys, type UpdateStorePayload } from '@/entities/store'
import { useAuthStore } from '@/entities/session'
import { markReportGenerating, reportKeys } from '@/entities/report'
import { dashboardKeys } from '@/entities/dashboard'

/**
 * 가게 수정 훅 (PATCH /api/v1/users/me/stores/{storeId}).
 * 성공하면 가게 목록을 무효화하고, 세션 사용자도 갱신한다
 * (마이페이지 카드가 /users/me 의 대표 가게 요약을 쓰므로).
 * 다른 구로 이동이면 리포트·대시보드가 구 단위 데이터라 캐시도 정리한다.
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
      if (prevRegionCode && payload.regionCode !== prevRegionCode) {
        // 다음 리포트 조회는 새 구 생성(10~15초)일 수 있음 — 진입 즉시 생성 연출 예고
        markReportGenerating()
        // remove(invalidate 아님): 옛 구 리포트가 캐시로 떠 보이는 것 차단 — 다음 진입은 hard pending
        queryClient.removeQueries({ queryKey: reportKeys.all })
        // 홈 대시보드도 옛 구 데이터 — 다음 마운트 때 다시 받게만 (홈은 연출 없어 soft 무효화)
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      }
    },
  })
}
