/** 업종 (API: GET /api/v1/categories) */
export interface Category {
  categoryCode: string
  categoryName: string
}

/**
 * 업종 폴백 목록 (요식업 10종) — 서버 응답 전 placeholder·MSW 목 데이터로 사용.
 * 코드·표기는 백엔드 시드(V17, 서울시 상권 업종코드 CS1xxxxx)와 동일하게 유지.
 */
export const FALLBACK_CATEGORIES: Category[] = [
  { categoryCode: 'CS100001', categoryName: '한식음식점' },
  { categoryCode: 'CS100002', categoryName: '중식음식점' },
  { categoryCode: 'CS100003', categoryName: '일식음식점' },
  { categoryCode: 'CS100004', categoryName: '양식음식점' },
  { categoryCode: 'CS100005', categoryName: '제과점' },
  { categoryCode: 'CS100006', categoryName: '커피전문점' },
  { categoryCode: 'CS100007', categoryName: '치킨전문점' },
  { categoryCode: 'CS100008', categoryName: '분식전문점' },
  { categoryCode: 'CS100009', categoryName: '호프/간이주점' },
  { categoryCode: 'CS100010', categoryName: '패스트푸드점' },
]

/** 상권 (API: GET /api/v1/regions/lookup — lat/lng 는 명세 "(보류)" 라 optional) */
export interface Region {
  regionCode: string
  regionName: string
  address?: string
  lat?: number
  lng?: number
}

/** 가게 위치 (도로명·지번 + 좌표) */
export interface StoreLocation {
  /** 도로명 주소 (예: 서울 중구 명동10길 52) */
  roadAddress: string
  /** 지번 주소 (예: 서울 중구 충무로2가 65-4) */
  jibunAddress?: string
  lat: number
  lng: number
}

/** 온보딩 진행 중 수집하는 가게 정보 (부분) */
export interface StoreDraft {
  name?: string
  location?: StoreLocation
  /** 위치 확정 시 regions/lookup 으로 매핑한 상권 */
  region?: Region
  categoryCode?: string
  /** 창업일 (YYYY-MM-DD) */
  foundedDate?: string
}

/**
 * 내 가게 (GET /api/v1/users/me/stores).
 * 백엔드 store 테이블 분리 예정(유저당 여러 가게 + 대표 지정) — 명세 확정 전 선규격.
 */
export interface MyStore {
  storeId: number
  storeName: string
  /** 도로명 주소 */
  address?: string
  /** 창업일 (YYYY-MM-DD) */
  storeOpenDate?: string
  regionCode: string
  regionName?: string
  categoryCode: string
  categoryName?: string
  lat: number
  lng: number
  /** 대표 가게 여부 */
  isPrimary: boolean
}

/** 등록 완료된 가게 (PUT /api/v1/users/me/store 응답) */
export interface Store {
  regionCode: string
  regionName?: string
  categoryCode: string
  categoryName?: string
  lat: number
  lng: number
  storeName: string
  storeOpenDate: string
}
