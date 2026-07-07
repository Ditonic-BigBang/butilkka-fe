import { apiJson } from '@/shared/api/api'
import type { Category, Region, Store } from '../model/types'

/** store 엔티티가 소유한 쿼리 키 팩토리 */
export const storeKeys = {
  all: ['store'] as const,
  categories: () => [...storeKeys.all, 'categories'] as const,
}

/** 업종 목록 조회 (온보딩 업종 스텝) */
export function getCategories(): Promise<Category[]> {
  return apiJson<Category[]>('/api/v1/categories')
}

/**
 * 좌표/주소 → 상권 후보 조회.
 * 명세: keyword 또는 (lat, lng) 중 하나 — 404(매칭 없음)는 throw 로 전달된다.
 */
export function lookupRegion(
  params: { lat: number; lng: number } | { keyword: string },
): Promise<Region[]> {
  const query = new URLSearchParams(
    'keyword' in params
      ? { keyword: params.keyword }
      : { lat: String(params.lat), lng: String(params.lng) },
  )
  return apiJson<Region[]>(`/api/v1/regions/lookup?${query}`)
}

/** 가게 위치·업종 설정/수정 요청 (온보딩 완료 저장) */
export interface PutMyStorePayload {
  regionCode: string
  categoryCode: string
  lat: number
  lng: number
  storeName: string
  /** YYYY-MM-DD */
  storeOpenDate: string
}

export function putMyStore(payload: PutMyStorePayload): Promise<Store> {
  return apiJson<Store>('/api/v1/users/me/store', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
