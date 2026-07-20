import type { QueryClient } from '@tanstack/react-query'
import { dashboardKeys } from '@/entities/dashboard'
import { reportKeys } from './reportQueries'

/**
 * 대표 가게가 바뀌었을 때(위치 수정·대표 지정) 그 가게 기준 화면들의 캐시를 정리한다.
 * 리포트·홈 대시보드는 모두 "현재 대표 가게의 구" 기준 데이터라, 캐시를 남기면
 * 옛 가게 화면을 보여주다 백그라운드 refetch 가 끝나는 순간 조용히 갈아끼워진다.
 *
 * 리포트는 remove(무효화 아님) — 남은 데이터를 보여주는 대신 다음 진입을 로딩/생성 연출로 시작한다.
 * 대시보드는 invalidate — 홈은 생성 연출이 없어 이전 값을 잠깐 보여주며 갱신하는 편이 낫다.
 */
export function invalidatePrimaryStoreViews(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: reportKeys.all })
  void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
}
