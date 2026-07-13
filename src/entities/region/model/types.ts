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
