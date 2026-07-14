import { apiJson } from '@/shared/api/api'
import type { FavoriteItem } from '../model/types'

export const favoriteKeys = {
  all: ['favorite'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
}

/** GET /api/v1/favorites — 즐겨찾는 상권 목록 */
export function fetchFavorites(): Promise<FavoriteItem[]> {
  return apiJson<FavoriteItem[]>('/api/v1/favorites')
}

/** POST /api/v1/favorites — 즐겨찾기 등록 */
export function addFavorite(regionCode: string): Promise<FavoriteItem> {
  return apiJson<FavoriteItem>('/api/v1/favorites', {
    method: 'POST',
    body: JSON.stringify({ regionCode }),
  })
}

/** DELETE /api/v1/favorites/{regionCode} — 즐겨찾기 해제 */
export function removeFavorite(regionCode: string): Promise<void> {
  return apiJson<void>(`/api/v1/favorites/${encodeURIComponent(regionCode)}`, {
    method: 'DELETE',
  })
}
