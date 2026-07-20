import type { ReportHistoryItem } from '@/entities/report'

/**
 * 히스토리에서 "이전 분기 리포트"를 고른다.
 * 히스토리는 내 가게 전체의 리포트가 섞여 오므로 같은 상권(regionCode)만 후보로 둔다
 * — 다점포일 때 다른 가게의 이전 분기를 집는 것을 막기 위함.
 * 구버전 응답처럼 regionCode 가 없으면 분기만으로 비교(기존 동작 유지).
 */
export function pickPreviousReport(
  history: ReportHistoryItem[] | undefined,
  current: { quarter: string; regionCode?: string },
): ReportHistoryItem | undefined {
  return history?.find(
    (item) =>
      item.quarter < current.quarter &&
      (item.regionCode == null ||
        current.regionCode == null ||
        item.regionCode === current.regionCode),
  )
}
