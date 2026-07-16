import { useQuery } from '@tanstack/react-query'
import { regionKeys, searchRegions, type RegionSearchItem } from '@/entities/region'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import type { SearchResult } from '@/widgets/search'

type RegionSearchView = {
  /** SearchOverlay 에 넘길 결과 행 (id = 구 대표 상권 regionCode) */
  results: SearchResult[]
  /** 선택 처리용 원본 조회 (regionCode → 항목) */
  byId: Map<string, RegionSearchItem>
}

// 결과는 구 단위 표기("서대문구") — 같은 구의 상권 여러 개는 첫 항목을 대표로 중복 제거
function toView(items: RegionSearchItem[]): RegionSearchView {
  const byDistrict = new Map<string, RegionSearchItem>()
  items.forEach((item) => {
    if (!byDistrict.has(item.district)) byDistrict.set(item.district, item)
  })
  const unique = [...byDistrict.values()]

  return {
    results: unique.map((item) => ({ id: item.regionCode, label: item.district })),
    byId: new Map(unique.map((item) => [item.regionCode, item])),
  }
}

/**
 * 상권 검색 자동완성 — 입력이 잠잠해진 뒤(300ms)에만 `GET /regions/search` 호출.
 * enabled=false 면 호출하지 않는다 — 검색바가 선택된 구 표시용으로 채워져 있을 때(미포커스).
 */
export function useRegionSearch(keyword: string, enabled = true) {
  const debounced = useDebouncedValue(keyword.trim())

  const query = useQuery({
    queryKey: regionKeys.search(debounced),
    queryFn: ({ signal }) => searchRegions(debounced, signal),
    enabled: enabled && debounced.length > 0,
    select: toView,
  })

  return { results: query.data?.results, byId: query.data?.byId }
}
