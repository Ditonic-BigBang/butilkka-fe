import { useQuery } from '@tanstack/react-query'
import { regionKeys, searchRegions, type RegionSearchItem } from '@/entities/region'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import type { SearchResult } from '@/widgets/search'

type RegionSearchView = {
  /** SearchOverlay 에 넘길 결과 행 (id = regionCode) */
  results: SearchResult[]
  /** 선택 처리용 원본 조회 (regionCode → 항목) */
  byId: Map<string, RegionSearchItem>
}

function toView(items: RegionSearchItem[]): RegionSearchView {
  return {
    results: items.map((item) => ({
      id: item.regionCode,
      label: `${item.district} ${item.regionName}`,
    })),
    byId: new Map(items.map((item) => [item.regionCode, item])),
  }
}

/** 상권 검색 자동완성 — 입력이 잠잠해진 뒤(300ms)에만 `GET /regions/search` 호출 */
export function useRegionSearch(keyword: string) {
  const debounced = useDebouncedValue(keyword.trim())

  const query = useQuery({
    queryKey: regionKeys.search(debounced),
    queryFn: () => searchRegions(debounced),
    enabled: debounced.length > 0,
    select: toView,
  })

  return { results: query.data?.results, byId: query.data?.byId }
}
