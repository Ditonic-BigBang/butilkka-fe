import type { RegionGrade } from '@/entities/region/@x/favorite'

/** GET /favorites 항목 — 즐겨찾는 상권 */
export interface FavoriteItem {
  regionCode: string
  regionName: string
  district: string
  grade: RegionGrade
}
