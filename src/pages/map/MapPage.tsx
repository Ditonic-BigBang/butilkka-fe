import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { MobileLayout } from '@/widgets/mobile-layout'
import { KakaoMap, type KakaoMapHandle, type MapOutline } from '@/widgets/district-map'
import { useGuBoundaries } from '@/entities/district'
import { SearchOverlay, MAP_FILTERS } from '@/widgets/search'
import { MyLocation } from '@/shared/ui'
import { formatQuarter } from '@/shared/lib/quarter'
import type { RankingOrder } from '@/entities/region'
import { CATEGORY_BY_FILTER, getCategoryView, type MapCategory } from './model/mapCategory'
import { useRegionMarkers } from './model/useRegionMarkers'
import { useRanking } from './model/useRanking'
import { useRegionSearch } from './model/useRegionSearch'
import { useRegionDetail } from './model/useRegionDetail'
import { useFavorites } from './model/useFavorites'
import { RankingSheet } from './ui/RankingSheet'
import { QuarterSheet } from './ui/QuarterSheet'

// 검색/마커 선택 시 구 확대 레벨
const GU_ZOOM_LEVEL = 7
// 지도 위 포인터가 이만큼(px) 넘게 움직이면 탭이 아닌 패닝으로 판정
const MAP_TAP_THRESHOLD = 10

export default function MapPage() {
  const mapRef = useRef<KakaoMapHandle>(null)
  const [query, setQuery] = useState('')
  // 카테고리 칩 — 마커·시트 내용이 함께 바뀐다 (기본: 쇠퇴등급)
  const [category, setCategory] = useState<MapCategory>('grade')
  const [order, setOrder] = useState<RankingOrder>('top')
  const [registerMode, setRegisterMode] = useState(false)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  // 조회 분기 — null 이면 최신 분기(기본)
  const [quarter, setQuarter] = useState<string | null>(null)
  const [quarterSheetOpen, setQuarterSheetOpen] = useState(false)
  const [latestQuarter, setLatestQuarter] = useState<string>()

  // 선택한 구 — 상세 조회는 구 대표 상권 코드로, 경계 강조는 구 이름으로
  const [detailRegionCode, setDetailRegionCode] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  // 랭킹 시트 펼침 — 지도 탭으로도 접을 수 있게 페이지가 소유
  const [sheetExpanded, setSheetExpanded] = useState(false)

  const categoryView = getCategoryView(category)
  const {
    markers,
    centroids,
    regionByDistrict,
    quarter: dataQuarter,
  } = useRegionMarkers(category, quarter ?? undefined)
  const ranking = useRanking(category, order, quarter ?? undefined)
  const detail = useRegionDetail(detailRegionCode, category)
  const { data: guBoundaries } = useGuBoundaries()

  // 구 경계 폴리곤 — 선택한 구만 강조 표시
  const outlines = useMemo<MapOutline[]>(
    () =>
      guBoundaries
        ?.filter((b) => b.district === selectedDistrict)
        .map((b) => ({ id: b.district, rings: b.rings })) ?? [],
    [guBoundaries, selectedDistrict],
  )

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

  // 구 선택 — 경계 강조 + 시트 내용을 해당 구 상세로 전환 (시트 높이는 그대로)
  const selectDistrict = (district: string, regionCode: string) => {
    setSelectedDistrict(district)
    setDetailRegionCode(regionCode)
    panToDistrict(district)
  }
  const clearSelection = () => {
    setSelectedDistrict(null)
    setDetailRegionCode(null)
  }

  const handleResultSelect = (regionCode: string) => {
    const item = search.byId?.get(regionCode)
    if (!item) return
    setQuery('')
    if (registerMode) {
      addFavorite(regionCode)
      setRegisterMode(false)
      panToDistrict(item.district)
      return
    }
    selectDistrict(item.district, regionCode)
  }

  // 마커 탭 → 구 대표 상권 기준 선택
  const handleMarkerClick = (district: string) => {
    const region = regionByDistrict?.get(district)
    if (region) selectDistrict(district, region.regionCode)
    else panToDistrict(district)
  }

  // 지도 빈 곳 탭 → 펼쳐진 시트 접기 (패닝은 이동 거리로 걸러냄, 마커 탭은 전파가 끊겨 안 옴)
  const mapPressStart = useRef<{ x: number; y: number } | null>(null)
  const handleMapPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    mapPressStart.current = { x: e.clientX, y: e.clientY }
  }
  const handleMapClick = (e: MouseEvent<HTMLDivElement>) => {
    const start = mapPressStart.current
    mapPressStart.current = null
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > MAP_TAP_THRESHOLD) return
    setSheetExpanded(false)
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
        {/* 시트 접기용 탭 감지 래퍼 — 지도 자체가 인터랙션을 소유하므로 시맨틱 없음 */}
        <div
          role="presentation"
          className="absolute inset-0"
          onPointerDown={handleMapPointerDown}
          onClick={handleMapClick}
        >
          <KakaoMap
            ref={mapRef}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            outlines={outlines}
            myLocation={myLocation}
            className="size-full"
          />
        </div>

        <SearchOverlay
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          selectedFilter={categoryView.filterKey}
          onFilterSelect={(key) => {
            if (key === 'period') {
              setQuarterSheetOpen(true)
              return
            }
            // 디자인 확정된 카테고리 칩만 전환 (CATEGORY_BY_FILTER) — 나머지는 표시만
            const next = CATEGORY_BY_FILTER[key]
            if (next) setCategory(next)
          }}
          results={search.results}
          onResultSelect={handleResultSelect}
          savedPlaces={favorites.map((f) => f.regionName)}
          onAddPlace={() => setRegisterMode(true)}
          registerMode={registerMode}
          className="absolute inset-x-0 top-0 z-10"
        />

        {/* 내 위치 버튼은 시트 바로 위에 붙어 시트 높이 변화를 따라간다 — 래퍼는 지도 조작을 막지 않게 클릭 통과 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col">
          <MyLocation
            onClick={handleMyLocation}
            className="pointer-events-auto mr-5 mb-3 self-end"
          />
          <RankingSheet
            title={categoryView.title}
            tabs={categoryView.tabs}
            order={order}
            onOrderChange={setOrder}
            rows={ranking.data?.rows ?? []}
            averagePeriod={ranking.data?.averagePeriod}
            onRowClick={(row) => selectDistrict(row.name.replace(/^서울\s*/, ''), row.regionCode)}
            detail={detailRegionCode !== null ? detail.data : null}
            onClearDetail={clearSelection}
            expanded={sheetExpanded}
            onExpandedChange={setSheetExpanded}
            isPending={ranking.isPending}
            isError={ranking.isError}
            onRetry={() => void ranking.refetch()}
            className="pointer-events-auto"
          />
        </div>

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
