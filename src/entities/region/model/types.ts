// 상권(region) 도메인 DTO — API명세서 V3 기준.
// region = 상권(예: 가로수길), district = 자치구(예: 서대문구).

/** 쇠퇴등급 — A(안전) ~ E(위험) 5단계 */
export type RegionGrade = 'A' | 'B' | 'C' | 'D' | 'E'

/** 전분기 대비 변화 방향 */
export type RegionDirection = 'UP' | 'DOWN' | 'FLAT'

/** 랭킹 정렬 — top: 위험 높은 순 · bottom: 안전한 순 */
export type RankingOrder = 'top' | 'bottom'

/** GET /regions/map 의 regions[] 항목 */
export interface RegionMapItem {
  regionCode: string
  regionName: string
  /** 자치구 (예: "서대문구") */
  district: string
  grade: RegionGrade
}

/** GET /regions/map — 지도 색상 데이터 (경계 폴리곤은 정적 geojson 별도) */
export interface RegionMapResponse {
  quarter: string
  regions: RegionMapItem[]
}

/** GET /regions/declineRanking 의 regions[] 항목 */
export interface RegionRankingItem {
  rank: number
  regionCode: string
  regionName: string
  /** 명세(V3)가 snake_case 로 내려주는 필드 — 변환하지 않고 그대로 둔다 */
  decline_grade: RegionGrade
  direction: RegionDirection
}

/** GET /regions/declineRanking — 쇠퇴 등급 Top5 순위 */
export interface RegionRankingResponse {
  order: RankingOrder
  quarter: string
  regions: RegionRankingItem[]
}

/** GET /regions/search — 상권 검색(자동완성) 항목 */
export interface RegionSearchItem {
  regionCode: string
  regionName: string
  district: string
}

// ── 지표별 지도/랭킹 (선규격 — 백엔드 미구현, MSW 목 전용. 상세 응답 필드명을 지표 키로 재사용) ──

/** 지표 키 — RegionDetailResponse 의 수치 지표 필드명과 동일 */
export type MetricKey = 'rentRatio' | 'footTraffic' | 'vacancyRate' | 'closureRate' | 'storeCount'

/** GET /regions/metricMap 의 regions[] 항목 — 원시 단위 값(원·명·% 등) */
export interface RegionMetricMapItem {
  regionCode: string
  regionName: string
  district: string
  value: number
}

/** GET /regions/metricMap — 지표별 지도 값 데이터 */
export interface RegionMetricMapResponse {
  metric: MetricKey
  quarter: string
  regions: RegionMetricMapItem[]
}

/** GET /regions/metricRanking 의 regions[] 항목 */
export interface RegionMetricRankingItem {
  rank: number
  regionCode: string
  regionName: string
  value: number
  direction: RegionDirection
}

/** GET /regions/metricRanking — 지표별 Top5 순위 (order: top 상위 · bottom 하위) */
export interface RegionMetricRankingResponse {
  metric: MetricKey
  order: RankingOrder
  quarter: string
  regions: RegionMetricRankingItem[]
}

// ── 상권 상세 (GET /districts/{regionCode} — URI 명칭과 달리 path 는 상권코드) ──

/** 분기별 등급 추이 포인트 */
export interface GradeTrendPoint {
  quarter: string
  grade: RegionGrade
}

/** 분기별 값 추이 포인트 */
export interface MetricTrendPoint {
  quarter: string
  value: number
}

/** 쇠퇴등급 요약 — current/previous + 12분기 추이 */
export interface DeclineGradeSummary {
  current: RegionGrade
  previous: RegionGrade
  trend: GradeTrendPoint[]
}

/** 수치 지표 요약 (매출 대비 임대료·유동인구·공실률) */
export interface MetricSummary {
  value: number
  changeRate: number
  direction: RegionDirection
  trend: MetricTrendPoint[]
}

/** 폐업률 — 공통 구조 + 평균 영업 기간 */
export interface ClosureRateSummary extends MetricSummary {
  avgOperatingYears: number
  seoulAvgOperatingYears: number
}

export interface CategoryCount {
  category: string
  count: number
}

/** 점포 수 — 증감 개수 + 업종 분포 */
export interface StoreCountSummary {
  value: number
  changeCount: number
  direction: RegionDirection
  trend: MetricTrendPoint[]
  categoryDistribution: CategoryCount[]
}

/** GET /districts/{regionCode} — 특정 상권 상세 */
export interface RegionDetailResponse {
  regionCode: string
  district: string
  regionName: string
  quarter: string
  declineGrade: DeclineGradeSummary
  rentRatio: MetricSummary
  footTraffic: MetricSummary
  vacancyRate: MetricSummary
  closureRate: ClosureRateSummary
  storeCount: StoreCountSummary
}
