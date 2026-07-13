import { useCallback, useRef, useState } from 'react'
import { MobileLayout } from '@/widgets/mobile-layout'
import { KakaoMap, type KakaoMapHandle } from '@/widgets/district-map'
import { SearchOverlay, MAP_FILTERS } from '@/widgets/search'
import { MyLocation } from '@/shared/ui'
import type { RankingOrder } from '@/entities/region'
import { useRegionMarkers } from './model/useRegionMarkers'
import { useDeclineRanking } from './model/useDeclineRanking'
import { useRegionSearch } from './model/useRegionSearch'
import { useFavorites } from './model/useFavorites'
import { RankingSheet } from './ui/RankingSheet'

// 검색/마커 선택 시 구 확대 레벨, 내 위치는 더 가깝게
const GU_ZOOM_LEVEL = 7
const MY_LOCATION_ZOOM_LEVEL = 5

export default function MapPage() {
  const mapRef = useRef<KakaoMapHandle>(null)
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<RankingOrder>('top')
  const [registerMode, setRegisterMode] = useState(false)

  const { markers, centroids } = useRegionMarkers()
  const ranking = useDeclineRanking(order)
  const search = useRegionSearch(query)
  const { favorites, add: addFavorite } = useFavorites()

  const panToDistrict = useCallback(
    (district: string) => {
      const point = centroids?.get(district)
      if (point) mapRef.current?.panTo(point.lat, point.lng, GU_ZOOM_LEVEL)
    },
    [centroids],
  )

  const handleResultSelect = (regionCode: string) => {
    const item = search.byId?.get(regionCode)
    if (!item) return
    if (registerMode) {
      addFavorite(regionCode)
      setRegisterMode(false)
    }
    setQuery('')
    panToDistrict(item.district)
  }

  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      mapRef.current?.panTo(pos.coords.latitude, pos.coords.longitude, MY_LOCATION_ZOOM_LEVEL)
    })
  }

  return (
    <MobileLayout>
      <div className="relative h-full overflow-hidden">
        <KakaoMap
          ref={mapRef}
          markers={markers}
          onMarkerClick={panToDistrict}
          className="absolute inset-0"
        />

        <SearchOverlay
          query={query}
          onQueryChange={setQuery}
          filters={MAP_FILTERS}
          // 백엔드가 쇠퇴등급 지도만 지원 — 다른 지표 칩은 표시만 (API 확장 시 상태로 전환)
          selectedFilter="grade"
          results={search.results}
          onResultSelect={handleResultSelect}
          savedPlaces={favorites.map((f) => f.regionName)}
          onAddPlace={() => setRegisterMode(true)}
          registerMode={registerMode}
          className="absolute inset-x-0 top-0 z-10"
        />

        <MyLocation onClick={handleMyLocation} className="absolute right-5 bottom-[118px] z-10" />

        <RankingSheet
          order={order}
          onOrderChange={setOrder}
          rows={ranking.data ?? []}
          isPending={ranking.isPending}
          isError={ranking.isError}
          onRetry={() => void ranking.refetch()}
          className="absolute inset-x-0 bottom-0 z-10"
        />
      </div>
    </MobileLayout>
  )
}
