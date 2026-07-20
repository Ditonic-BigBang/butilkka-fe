import type { ReportHistoryItem } from '@/entities/report'

/** 리포트가 가리키는 자치구 — 히스토리 항목과 대조할 식별자 */
export type ReportDistrict = {
  quarter: string
  regionCode?: string
  /** 자치구명 (예: "마포구") */
  districtName?: string
}

/**
 * 히스토리 항목이 같은 자치구의 리포트인지.
 * 코드와 이름 중 **하나라도** 일치하면 같은 구로 본다 — 히스토리의 `regionCode`(자치구 5자리)와
 * 리포트 상세의 `regionCode` 가 서로 다른 체계일 가능성이 있어(상세는 `regionName` 상권명과
 * `districtName` 자치구명을 따로 가진다), 자치구명 비교를 폴백으로 함께 둔다.
 * 구 식별자가 아예 없는 구버전 응답은 분기만으로 비교(기존 동작 유지).
 */
function isSameDistrict(item: ReportHistoryItem, current: ReportDistrict): boolean {
  if (item.regionCode == null && item.regionName == null) return true
  if (item.regionCode && current.regionCode && item.regionCode === current.regionCode) return true
  if (item.regionName && current.districtName && item.regionName === current.districtName)
    return true
  return false
}

/**
 * 히스토리에서 "이전 분기 리포트"를 고른다.
 * 서버가 현재 대표 가게의 구 리포트만 주므로 같은 구 조건은 이중 안전장치다
 * — 필터가 빠지거나 응답이 섞여 와도 다른 가게의 지난 분기를 집지 않는다.
 */
export function pickPreviousReport(
  history: ReportHistoryItem[] | undefined,
  current: ReportDistrict,
): ReportHistoryItem | undefined {
  return history?.find((item) => item.quarter < current.quarter && isSameDistrict(item, current))
}
