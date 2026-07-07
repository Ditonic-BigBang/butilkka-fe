import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import type { StoreLocation } from '@/entities/store'

/** 검색 결과 한 건 — 장소(키워드) 결과면 id(카카오 장소 ID)와 placeName 이 담긴다 */
export interface AddressResult {
  /** 카카오 장소 고유 ID — 주소 결과에는 없음 (리스트 key: id ?? 좌표) */
  id?: string
  placeName?: string
  location: StoreLocation
}

/**
 * 이 위젯이 소유한 쿼리 키 팩토리 (TkDodo 패턴).
 * 무효화·prefetch 등 외부 참조가 생기면 index.ts public API 로 승격해서 쓴다.
 */
export const addressSearchKeys = {
  all: ['address-search'] as const,
  query: (query: string) => [...addressSearchKeys.all, query] as const,
}

/** Geocoder/Places 사용 가능 여부 — SDK 가 services 라이브러리와 함께 로드됐는지 */
function servicesReady(): boolean {
  return typeof kakao !== 'undefined' && !!kakao.maps?.services
}

function toAddressResult(r: kakao.maps.services.AddressSearchResult): AddressResult {
  return {
    location: {
      roadAddress: r.road_address?.address_name ?? r.address_name,
      jibunAddress: r.address?.address_name,
      lat: Number(r.y),
      lng: Number(r.x),
    },
  }
}

/**
 * 같은 좌표의 중복 항목 병합 — 카카오 addressSearch 는 같은 필지를
 * 지번/도로명 두 레코드로 반환할 수 있다. 도로명 주소가 있는 쪽을 우선.
 */
function dedupeByCoord(results: AddressResult[]): AddressResult[] {
  const byCoord = new Map<string, AddressResult>()

  for (const r of results) {
    const key = `${r.location.lat},${r.location.lng}`
    const prev = byCoord.get(key)
    // 도로명 보유 여부 — 도로명이 없으면 roadAddress 에 지번이 폴백돼 둘이 같아진다
    const hasRoad = r.location.roadAddress !== r.location.jibunAddress
    const prevHasRoad = prev != null && prev.location.roadAddress !== prev.location.jibunAddress

    if (!prev || (hasRoad && !prevHasRoad)) byCoord.set(key, r)
  }

  return [...byCoord.values()]
}

function toPlaceResult(r: kakao.maps.services.PlaceSearchResult): AddressResult {
  return {
    id: r.id,
    placeName: r.place_name,
    location: {
      roadAddress: r.road_address_name || r.address_name,
      jibunAddress: r.address_name || undefined,
      lat: Number(r.y),
      lng: Number(r.x),
    },
  }
}

/**
 * 주소 검색 → 매칭 없으면 장소(건물명·상호) 검색 폴백. Figma 검색 팁 3종 커버:
 * 1) 도로명+건물번호 · 2) 동/리+번지 → Geocoder.addressSearch
 * 3) 동/리+건물명 → Places.keywordSearch
 * ERROR 는 reject → react-query 가 재시도(retry 1), ZERO_RESULT 는 빈 배열.
 */
function searchAddress(query: string): Promise<AddressResult[]> {
  return new Promise((resolve, reject) => {
    if (!servicesReady()) return resolve([])

    new kakao.maps.services.Geocoder().addressSearch(query, (addresses, status) => {
      if (status === 'OK') return resolve(dedupeByCoord(addresses.map(toAddressResult)))
      if (status === 'ERROR') return reject(new Error('주소 검색에 실패했습니다.'))

      new kakao.maps.services.Places().keywordSearch(query, (places, placeStatus) => {
        if (placeStatus === 'OK') return resolve(places.map(toPlaceResult))
        if (placeStatus === 'ERROR') return reject(new Error('장소 검색에 실패했습니다.'))
        resolve([])
      })
    })
  })
}

/**
 * 주소/장소 검색 쿼리 — 입력 디바운스(300ms) 후 검색, 같은 검색어는 캐시에서 즉시.
 * `keepPreviousData` 로 타이핑 중에는 이전 결과를 유지해 화면 깜빡임을 막는다.
 */
export function useAddressSearch(query: string, sdkReady: boolean) {
  const debounced = useDebouncedValue(query.trim(), 300)
  const enabled = sdkReady && debounced.length >= 2

  const { data, isSuccess, isFetching } = useQuery({
    queryKey: addressSearchKeys.query(debounced),
    queryFn: () => searchAddress(debounced),
    enabled,
    staleTime: 5 * 60 * 1000, // 주소·장소는 잘 안 변함 — 세션 내 재검색은 캐시로
    placeholderData: keepPreviousData,
  })

  return {
    results: enabled ? (data ?? []) : [],
    /** 검색이 한 번이라도 완료됐는지 (빈 결과 문구 노출용) */
    searched: enabled && isSuccess,
    isSearching: enabled && isFetching,
  }
}

/** 좌표 → 주소 (지도 이동·현위치용) — 명령형 1회 호출이라 쿼리로 감싸지 않는다 */
export function coordToLocation(lat: number, lng: number): Promise<StoreLocation | null> {
  return new Promise((resolve) => {
    if (!servicesReady()) return resolve(null)

    new kakao.maps.services.Geocoder().coord2Address(lng, lat, (result, status) => {
      if (status !== 'OK' || result.length === 0) return resolve(null)
      const r = result[0]
      resolve({
        roadAddress: r.road_address?.address_name ?? r.address.address_name,
        jibunAddress: r.address.address_name,
        lat,
        lng,
      })
    })
  })
}
