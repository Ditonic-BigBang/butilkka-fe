export type SearchFilter = {
  key: string
  label: string
  /** 우측 캐럿(▼) — 값 선택형 필터 */
  caret?: boolean
  /** 항목별 선택 상태 — 지정 시 selectedFilter 보다 우선 (기간+지표 동시 선택용) */
  selected?: boolean
}

/** 지도 상단 필터 (Figma: Map Filter 176:2528) */
export const MAP_FILTERS: SearchFilter[] = [
  { key: 'period', label: '기간', caret: true },
  { key: 'grade', label: '쇠퇴등급' },
  { key: 'sales', label: '매출/임대료' },
  { key: 'stores', label: '점포수' },
  { key: 'population', label: '유동인구' },
  { key: 'vacancy', label: '공실률' },
  { key: 'closure', label: '폐업률' },
]
