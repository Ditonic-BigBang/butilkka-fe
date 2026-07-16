import type { MetricKey, RegionDirection } from '@/entities/region'

/** 지도 카테고리 — 쇠퇴등급 또는 수치 지표(상세 응답 필드명 재사용) */
export type MapCategory = 'grade' | MetricKey

/** 서버 방향(UP/DOWN/FLAT) → ChangeIndicator 방향 */
export const DIRECTION_UI: Record<RegionDirection, 'up' | 'down' | 'same'> = {
  UP: 'up',
  DOWN: 'down',
  FLAT: 'same',
}

export type MetricConfig = {
  /** 시트 헤더 제목 (예: "매출 대비 임대료") */
  title: string
  /** 상세 상단 표시 단위 (예: "원") */
  unit: string
  /** 원시 값 → 상세 상단 표시 값 */
  toDisplayValue: (raw: number) => number
  /** 지도 마커·랭킹처럼 좁은 영역에서 사용할 단위와 값 */
  compactUnit: string
  toCompactValue: (raw: number) => number
  /** 추이 그래프에서 사용할 단위와 값 */
  trendUnit: string
  toTrendValue: (raw: number) => number
  /** 그래프 y축 눈금 라벨 (그래프 단위 기준) */
  toAxisLabel?: (value: number) => string
}

const rounded = (value: number) => Math.round(value)
const oneDecimal = (value: number) => Math.round(value * 10) / 10
const axisDecimal = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })

export const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  rentRatio: {
    title: '매출 대비 임대료',
    unit: '원',
    toDisplayValue: rounded,
    compactUnit: '만원',
    toCompactValue: (value) => Math.round(value / 10_000),
    trendUnit: '천만원',
    toTrendValue: (value) => value / 10_000_000,
    toAxisLabel: axisDecimal,
  },
  footTraffic: {
    title: '유동인구',
    unit: '명',
    toDisplayValue: rounded,
    compactUnit: '명',
    toCompactValue: rounded,
    trendUnit: '만명',
    toTrendValue: (value) => value / 10_000,
    toAxisLabel: axisDecimal,
  },
  vacancyRate: {
    title: '공실률',
    unit: '%',
    toDisplayValue: oneDecimal,
    compactUnit: '%',
    toCompactValue: oneDecimal,
    trendUnit: '%',
    toTrendValue: oneDecimal,
  },
  closureRate: {
    title: '폐업률',
    unit: '%',
    toDisplayValue: oneDecimal,
    compactUnit: '%',
    toCompactValue: oneDecimal,
    trendUnit: '%',
    toTrendValue: oneDecimal,
  },
  storeCount: {
    title: '점포수',
    unit: '개',
    toDisplayValue: rounded,
    compactUnit: '개',
    toCompactValue: rounded,
    trendUnit: '개',
    toTrendValue: rounded,
  },
}

/**
 * 필터 칩 key → 지도 카테고리.
 * 칩별 Figma 디자인이 확정된 카테고리만 등록 — 나머지 지표 칩은 표시만 되고 눌러도 무시된다.
 */
export const CATEGORY_BY_FILTER: Partial<Record<string, MapCategory>> = {
  grade: 'grade',
  sales: 'rentRatio',
  stores: 'storeCount',
  population: 'footTraffic',
  vacancy: 'vacancyRate',
  closure: 'closureRate',
}

const FILTER_BY_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_BY_FILTER).map(([filter, category]) => [category, filter]),
) as Record<MapCategory, string>

export type CategoryView = {
  /** 선택 표시할 필터 칩 key */
  filterKey: string
  /** 시트 헤더 제목 */
  title: string
  /** 정렬 탭 라벨 [top, bottom] */
  tabs: [string, string]
}

/** 카테고리별 랭킹 시트 표기 — 등급은 위험/안전 순, 지표는 상위/하위 5위 */
export function getCategoryView(category: MapCategory): CategoryView {
  if (category === 'grade') {
    return { filterKey: 'grade', title: '쇠퇴 등급', tabs: ['위험 높은 순', '안전한 순'] }
  }
  return {
    filterKey: FILTER_BY_CATEGORY[category],
    title: METRIC_CONFIG[category].title,
    tabs: ['상위 5위', '하위 5위'],
  }
}
