import { useQuery } from '@tanstack/react-query'
import { getMyStores, storeKeys } from '../api/storeApi'

/**
 * 내 가게 목록 조회 훅 (GET /api/v1/users/me/stores).
 * 대표 가게가 맨 위로 오도록 정렬해서 돌려준다.
 */
export function useMyStores() {
  return useQuery({
    queryKey: storeKeys.myStores(),
    queryFn: getMyStores,
    select: (stores) => stores.toSorted((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
  })
}
