import type { RegionGrade } from '@/entities/region/@x/favorite'

/** 즐겨찾는 지역 최대 개수 (Figma 1462:14168 — "최대 4개까지만 등록 가능합니다") */
export const MAX_FAVORITES = 4

/** GET /favorites 항목 — 즐겨찾는 상권 */
export interface FavoriteItem {
  regionCode: string
  regionName: string
  district: string
  grade: RegionGrade
}
