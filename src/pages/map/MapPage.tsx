import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MobileLayout } from '@/widgets/mobile-layout'
import { KakaoMap, type KakaoMapHandle } from '@/widgets/district-map'
import { SearchOverlay, MAP_FILTERS } from '@/widgets/search'
import { MyLocation } from '@/shared/ui'
import { formatQuarter } from '@/shared/lib/quarter'
import type { RankingOrder } from '@/entities/region'
import { DistrictSheet } from '@/widgets/district-sheet'
import { useRegionMarkers } from './model/useRegionMarkers'
import { useDeclineRanking } from './model/useDeclineRanking'
import { useRegionSearch } from './model/useRegionSearch'
import { useRegionDetail } from './model/useRegionDetail'
import { useFavorites } from './model/useFavorites'
import { RankingSheet } from './ui/RankingSheet'
import { QuarterSheet } from './ui/QuarterSheet'

// 검색/마커 선택 시 구 확대 레벨
const GU_ZOOM_LEVEL = 7

export default function MapPage() {
  const mapRef = useRef<KakaoMapHandle>(null)
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<RankingOrder>('top')
  const [registerMode, setRegisterMode] = useState(false)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  // 조회 분기 — null 이면 최신 분기(기본)
  const [quarter, setQuarter] = useState<string | null>(null)
  const [quarterSheetOpen, setQuarterSheetOpen] = useState(false)
  const [latestQuarter, setLatestQuarter] = useState<string>()

  // 선택한 구의 대표 상권 상세 (쇠퇴등급 시트) — null 이면 시트 닫힘
  const [detailRegionCode, setDetailRegionCode] = useState<string | null>(null)

  const {
    markers,
    centroids,
    regionByDistrict,
    quarter: dataQuarter,
  } = useRegionMarkers(quarter ?? undefined)
  const ranking = useDeclineRanking(order, quarter ?? undefined)
  const detail = useRegionDetail(detailRegionCode)

  // 기간 시트의 옵션 기준은 "데이터의 최신 분기" — 최초(미선택) 응답의 quarter 를 고정해둔다
  useEffect(() => {
    if (!latestQuarter && dataQuarter) setLatestQuarter(dataQuarter)
  }, [latestQuarter, dataQuarter])

  // 기간 칩 — 선택 시 라벨을 "2025년 3분기"로 바꾸고 선택 스타일 (쇠퇴등급 칩과 동시 선택)
  const filters = useMemo(
    () =>
      MAP_FILTERS.map((f) => {
        if (f.key !== 'period') return f
        return {
          key: f.key,
          caret: f.caret,
          label: quarter ? formatQuarter(quarter) : f.label,
          selected: quarter !== null,
        }
      }),
    [quarter],
  )
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
    setQuery('')
    panToDistrict(item.district)
    if (registerMode) {
      addFavorite(regionCode)
      setRegisterMode(false)
      return
    }
    setDetailRegionCode(regionCode)
  }

  // 마커 탭 → 해당 구로 이동 + 구 대표 상권의 쇠퇴등급 상세 시트
  const handleMarkerClick = (district: string) => {
    panToDistrict(district)
    const region = regionByDistrict?.get(district)
    if (region) setDetailRegionCode(region.regionCode)
  }

  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setMyLocation(point)
      // 줌 레벨은 건드리지 않고 현 위치로 이동만
      mapRef.current?.panTo(point.lat, point.lng)
    })
  }

  return (
    <MobileLayout>
      <div className="relative h-full overflow-hidden">
        <KakaoMap
          ref={mapRef}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          myLocation={myLocation}
          className="absolute inset-0"
        />

        <SearchOverlay
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          // 백엔드가 쇠퇴등급 지도만 지원 — 다른 지표 칩은 표시만 (API 확장 시 상태로 전환)
          selectedFilter="grade"
          onFilterSelect={(key) => {
            if (key === 'period') setQuarterSheetOpen(true)
          }}
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
          onRowClick={(row) => {
            panToDistrict(row.name.replace(/^서울\s*/, ''))
            setDetailRegionCode(row.regionCode)
          }}
          isPending={ranking.isPending}
          isError={ranking.isError}
          onRetry={() => void ranking.refetch()}
          className="absolute inset-x-0 bottom-0 z-10"
        />

        {detail.data && (
          <DistrictSheet
            open={detailRegionCode !== null}
            onClose={() => setDetailRegionCode(null)}
            title="쇠퇴 등급"
            subtitle={detail.data.subtitle}
            content={{
              type: 'grade',
              quarter: detail.data.quarterLabel,
              grade: detail.data.grade,
              status: detail.data.status,
              lastGrade: detail.data.lastGrade,
              trend: detail.data.trend,
              trendTicks: detail.data.trendTicks,
            }}
          />
        )}

        <QuarterSheet
          open={quarterSheetOpen}
          onClose={() => setQuarterSheetOpen(false)}
          latestQuarter={latestQuarter}
          value={quarter}
          onApply={setQuarter}
        />
      </div>
    </MobileLayout>
  )
}
