import { apiJson } from '@/shared/api/api'
import type { Category, MyStore, Region, Store } from '../model/types'

/** store 엔티티가 소유한 쿼리 키 팩토리 */
export const storeKeys = {
  all: ['store'] as const,
  categories: () => [...storeKeys.all, 'categories'] as const,
  myStores: () => [...storeKeys.all, 'my'] as const,
}

/** 내 가게 목록 조회 (GET /api/v1/users/me/stores) — 다점포·대표가게 선규격 */
export function getMyStores(): Promise<MyStore[]> {
  return apiJson<MyStore[]>('/api/v1/users/me/stores')
}

/** 가게 추가 요청 (POST /api/v1/users/me/stores) */
export interface CreateStorePayload {
  regionCode: string
  categoryCode: string
  lat: number
  lng: number
  storeName: string
  /** YYYY-MM-DD */
  storeOpenDate: string
  /** 도로명 주소 — 요청은 storeAddress, 응답(store.address)과 필드명이 다름(스웨거 계약) */
  storeAddress: string
}

/** 가게 추가 (POST /api/v1/users/me/stores) — 목록에 새 가게로 추가(대표 아님) */
export function createStore(payload: CreateStorePayload): Promise<MyStore> {
  return apiJson<MyStore>('/api/v1/users/me/stores', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 가게 수정 요청 (PATCH /api/v1/users/me/stores/{storeId} — 변경 필드만 부분 전송) */
export interface UpdateStorePayload {
  storeName?: string
  /** YYYY-MM-DD */
  storeOpenDate?: string
  /** 도로명 주소 — 요청은 storeAddress, 응답(store.address)과 필드명이 다름(스웨거 계약) */
  storeAddress?: string
  regionCode?: string
  categoryCode?: string
  lat?: number
  lng?: number
  /** 대표 가게 지정 */
  isPrimary?: boolean
}

/** 가게 수정 (PATCH /api/v1/users/me/stores/{storeId}) — 위치·이름·창업일 등 부분 갱신 */
export function updateStore(storeId: number, payload: UpdateStorePayload): Promise<MyStore> {
  return apiJson<MyStore>(`/api/v1/users/me/stores/${storeId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** 대표 가게 지정 — updateStore 의 isPrimary 전용 래퍼 */
export function setPrimaryStore(storeId: number): Promise<MyStore> {
  return updateStore(storeId, { isPrimary: true })
}

/** 가게 삭제 (DELETE /api/v1/users/me/stores/{storeId}) */
export function deleteStore(storeId: number): Promise<void> {
  return apiJson<void>(`/api/v1/users/me/stores/${storeId}`, {
    method: 'DELETE',
  })
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
  /** 도로명 주소 — 요청은 storeAddress, 응답(store.address)과 필드명이 다름(스웨거 계약) */
  storeAddress: string
}

export function putMyStore(payload: PutMyStorePayload): Promise<Store> {
  return apiJson<Store>('/api/v1/users/me/store', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
