import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileLayout } from '@/widgets/mobile-layout'
import { PaywallLock } from '@/widgets/paywall-lock'
import { cn } from '@/shared/lib/cn'
import {
  KakaoMap,
  type KakaoMapHandle,
  type MapMarker,
  type MapOutline,
} from '@/widgets/district-map'
import { findDistrictAt, useGuGeometry } from '@/entities/district'
import { SearchOverlay, MAP_FILTERS } from '@/widgets/search'
import { MyLocation, Toast } from '@/shared/ui'
import { formatQuarter } from '@/shared/lib/quarter'
import { useTransientToast } from '@/shared/lib/useTransientToast'
import type { RankingOrder } from '@/entities/region'
import { CATEGORY_BY_FILTER, getCategoryView, type MapCategory } from './model/mapCategory'
import { useRegionMarkers } from './model/useRegionMarkers'
import { useRanking } from './model/useRanking'
import { useRegionSearch } from './model/useRegionSearch'
import { useRegionDetail } from './model/useRegionDetail'
import { useFavorites, MAX_FAVORITES } from '@/entities/favorite'
import { useMyStores } from '@/entities/store'
import { useAuthStore } from '@/entities/session'
import { RankingSheet } from './ui/RankingSheet'
import { QuarterSheet } from './ui/QuarterSheet'
import { RegisterSelect } from './ui/RegisterSelect'

// 검색/마커 선택 시 구 확대 레벨
const GU_ZOOM_LEVEL = 7
// 즐겨찾기 "지도에서 선택" 구 강조 색 (Figma 257:7523 — 핑크)
const REGISTER_OUTLINE_COLOR = '#f1c0dc'
// 첫 진입 센터링 보정(px) — 마커가 상단 오버레이(검색+칩)와 접힌 시트 사이
// "보이는 영역"의 가운데에 오도록, 두 오버레이 높이 차의 절반만큼 위로 올린다
const INITIAL_FOCUS_OFFSET_Y = 33

const NO_MARKERS: MapMarker[] = []

export default function MapPage() {
  const navigate = useNavigate()
  // 상권 지도는 PRO 혜택 — 구독 전엔 지도·검색·랭킹 시트를 통째로 덮는다 (하단 탭은 유지)
  const locked = !useAuthStore((s) => s.user?.isReportPro)
  const location = useLocation()
  const mapRef = useRef<KakaoMapHandle>(null)
  const [query, setQuery] = useState('')
  // 검색 모드(검색바 포커스) — 풀스크린 흰 화면 + 하단 탭 숨김 (Figma: 지도 - 검색시 257:7104)
  const [searching, setSearching] = useState(false)
  // 카테고리 칩 — 마커·시트 내용이 함께 바뀐다 (기본: 쇠퇴등급)
  const [category, setCategory] = useState<MapCategory>('grade')
  const [order, setOrder] = useState<RankingOrder>('top')
  const [registerMode, setRegisterMode] = useState(false)
  // 즐겨찾기 "지도에서 선택" 모드 — 지도 탭으로 구를 고른다 (Figma 257:7523)
  const [mapSelecting, setMapSelecting] = useState(false)
  const [mapSelectDistrict, setMapSelectDistrict] = useState<string | null>(null)
  // 등록 완료 안내 토스트 (Figma 257:9468) — 노출 후 퇴장 애니를 거쳐 자동 닫힘
  const { toast, closing: toastClosing, show: showToast } = useTransientToast()
  // 지도 선택/등록 후 검색 화면으로 복귀할 때 input 을 다시 포커스
  const [pendingSearchFocus, setPendingSearchFocus] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  // "지도에서 선택" 진입 blur 는 등록 모드를 풀지 않게 구분
  const enteringMapSelect = useRef(false)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const myLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const locatingRef = useRef(false)
  // 조회 분기 — null 이면 최신 분기(기본)
  const [quarter, setQuarter] = useState<string | null>(null)
  const [quarterSheetOpen, setQuarterSheetOpen] = useState(false)
  const [latestQuarter, setLatestQuarter] = useState<string>()

  // 선택한 구 — 상세 조회는 구 대표 상권 코드로, 경계 강조는 구 이름으로
  const [detailRegionCode, setDetailRegionCode] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  // 랭킹 시트 펼침 — 지도 탭으로도 접을 수 있게 페이지가 소유
  const [sheetExpanded, setSheetExpanded] = useState(false)
  // 리포트 "지도에서 확인하기"로 넘어온 구 — 지도·데이터 준비 후 포커싱
  const [pendingFocusDistrict, setPendingFocusDistrict] = useState<string | null>(null)

  const categoryView = getCategoryView(category)
  const { boundaries: guBoundaries, centroids } = useGuGeometry()
  const {
    markers,
    regionByDistrict,
    quarter: dataQuarter,
  } = useRegionMarkers(category, quarter ?? undefined, centroids)
  const ranking = useRanking(category, order, quarter ?? undefined)
  const detail = useRegionDetail(detailRegionCode, category, quarter ?? undefined)

  // 구 경계 폴리곤 — 평소엔 선택한 구 오렌지, 지도에서 선택 모드엔 고른 구 핑크
  const outlines = useMemo<MapOutline[]>(() => {
    if (!guBoundaries) return []
    if (mapSelecting) {
      return guBoundaries
        .filter((b) => b.district === mapSelectDistrict)
        .map((b) => ({
          id: b.district,
          rings: b.rings,
          color: REGISTER_OUTLINE_COLOR,
          fillOpacity: 0.5,
        }))
    }
    return guBoundaries
      .filter((b) => b.district === selectedDistrict)
      .map((b) => ({ id: b.district, rings: b.rings }))
  }, [guBoundaries, selectedDistrict, mapSelecting, mapSelectDistrict])

  // 기간 시트의 옵션 기준은 "데이터의 최신 분기" — 최초(미선택) 응답의 quarter 를 고정해둔다
  useEffect(() => {
    if (!latestQuarter && dataQuarter) setLatestQuarter(dataQuarter)
  }, [latestQuarter, dataQuarter])

  // 분기·카테고리 변경으로 구 대표 코드가 달라지면 선택된 구의 상세 조회도 같은 기준으로 맞춘다.
  useEffect(() => {
    if (!selectedDistrict || !regionByDistrict) return
    const nextRegionCode = regionByDistrict.get(selectedDistrict)?.regionCode
    if (nextRegionCode) {
      setDetailRegionCode((current) => (current === nextRegionCode ? current : nextRegionCode))
    }
  }, [selectedDistrict, regionByDistrict])

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
  // 미포커스 검색바는 선택된 구 표시용 — 그 값으로 검색 API 를 부르지 않는다
  const search = useRegionSearch(query, searching)
  const { favorites, add: addFavorite } = useFavorites()
  // 첫 진입 시 지도 초기 위치 = 대표 가게가 속한 구 (목록은 대표가 맨 위로 정렬됨)
  const { data: myStores } = useMyStores()
  const primaryStore = myStores?.[0]

  const panToDistrict = useCallback(
    (district: string) => {
      const point = centroids?.get(district)
      if (point) mapRef.current?.panTo(point.lat, point.lng, GU_ZOOM_LEVEL)
    },
    [centroids],
  )

  // 구 선택 — 경계 강조 + 시트 내용을 해당 구 상세로 전환 (시트 높이는 그대로)
  const selectDistrict = useCallback(
    (district: string, regionCode: string) => {
      setSelectedDistrict(district)
      setDetailRegionCode(regionCode)
      panToDistrict(district)
    },
    [panToDistrict],
  )
  const clearSelection = useCallback(() => {
    setSelectedDistrict(null)
    setDetailRegionCode(null)
  }, [])

  // 선택된 구를 검색바에 유지 (Figma 176:2687 — 미포커스 검색바에 "서대문구" + ✕).
  // 검색 중(포커스)엔 사용자의 입력을 존중하고, 검색을 닫으면 선택된 구로 복원한다.
  useEffect(() => {
    if (!searching) setQuery(selectedDistrict ?? '')
  }, [searching, selectedDistrict])

  // 미포커스 상태의 ✕(값 지우기) = 구 선택 해제 (전체 보기와 동일)
  const handleQueryChange = (next: string) => {
    setQuery(next)
    if (!next && !searching && selectedDistrict) clearSelection()
  }

  // 첫 진입 시 대표 가게의 구로 지도 이동 — 지도·가게·경계가 모두 준비된 뒤 딱 한 번.
  // 가게가 없거나(온보딩 전) 이미 구를 선택했으면 기본(서울 전체) 유지.
  const [mapReady, setMapReady] = useState(false)
  const initialFocusDone = useRef(false)
  useEffect(() => {
    if (initialFocusDone.current || !mapReady || !primaryStore || !guBoundaries || !centroids)
      return
    if (selectedDistrict || pendingFocusDistrict) {
      initialFocusDone.current = true
      return
    }
    // 좌표 → 구 판정, 경계 밖(좌표 오류 등)이면 주소의 "~구" 토큰 폴백
    const district =
      findDistrictAt({ lat: primaryStore.lat, lng: primaryStore.lng }, guBoundaries) ??
      primaryStore.address?.split(' ').find((token) => token.endsWith('구'))
    initialFocusDone.current = true
    const point = district ? centroids.get(district) : undefined
    if (point) mapRef.current?.panTo(point.lat, point.lng, GU_ZOOM_LEVEL, INITIAL_FOCUS_OFFSET_Y)
  }, [mapReady, primaryStore, guBoundaries, centroids, selectedDistrict, pendingFocusDistrict])

  // 리포트에서 넘어온 구 포커싱 — 지도·마커 데이터가 준비되면 해당 구 선택+이동
  useEffect(() => {
    if (!pendingFocusDistrict || !mapReady || !centroids || !regionByDistrict) return
    const representative = regionByDistrict.get(pendingFocusDistrict)
    if (representative) selectDistrict(pendingFocusDistrict, representative.regionCode)
    // 상권 데이터가 없는 구면 선택 없이 이동만 (즐겨찾기 선택과 동일한 폴백)
    else panToDistrict(pendingFocusDistrict)
    setPendingFocusDistrict(null)
  }, [pendingFocusDistrict, mapReady, centroids, regionByDistrict, selectDistrict, panToDistrict])

  // 즐겨찾기 등록 완료 — 검색 화면으로 복귀해 갱신된 목록 + 토스트를 보여준다 (Figma 257:9468)
  const finishRegister = () => {
    setRegisterMode(false)
    setMapSelecting(false)
    setMapSelectDistrict(null)
    showToast('즐겨찾는 지역에 등록되었습니다.')
    setPendingSearchFocus(true)
  }

  const registerDistrict = (district: string, fallbackCode?: string) => {
    // 최대 개수 초과 방어 — 진입점(추가 버튼)은 막혀 있지만 등록 모드 잔류 등 우회 경로 대비
    if (favorites.length >= MAX_FAVORITES) {
      showToast('최대 4개까지만 등록 가능합니다')
      return
    }
    const code = regionByDistrict?.get(district)?.regionCode ?? fallbackCode
    // 상권 데이터가 없는 구는 등록할 대표 상권이 없다 — 조용히 무시하지 않고 안내
    if (!code) {
      showToast('해당 구의 상권 데이터가 아직 없어요.')
      return
    }
    addFavorite(code, { onSuccess: finishRegister })
  }

  const handleResultSelect = (regionCode: string) => {
    const item = search.byId?.get(regionCode)
    if (!item) return
    setQuery('')
    if (registerMode) {
      registerDistrict(item.district, regionCode)
      return
    }
    // 상세는 마커 클릭과 같은 구 대표 상권 기준 (검색 결과의 첫 상권이 아니라)
    const representative = regionByDistrict?.get(item.district)
    selectDistrict(item.district, representative?.regionCode ?? regionCode)
  }

  // 마커 탭 → 구 대표 상권 기준 선택
  const handleMarkerClick = useCallback(
    (district: string) => {
      const region = regionByDistrict?.get(district)
      if (region) selectDistrict(district, region.regionCode)
      else panToDistrict(district)
    },
    [panToDistrict, regionByDistrict, selectDistrict],
  )

  const handleMapReady = useCallback(() => setMapReady(true), [])

  // 지도 빈 곳 탭 → 펼쳐진 시트 접기. kakao click 은 드래그 뒤에는 발생하지 않는다.
  const handleMapBackgroundClick = useCallback(() => setSheetExpanded(false), [])

  // "지도에서 선택" 진입 — 검색 화면이 닫히면서 지도 선택 모드로
  const handleSelectFromMap = () => {
    enteringMapSelect.current = true
    setMapSelectDistrict(null)
    setMapSelecting(true)
  }

  // 지도 선택 모드에서 지도 탭 → 좌표가 속한 구 판정 (kakao 클릭은 드래그와 자동 구분)
  const handleRegisterMapClick = useCallback(
    (point: { lat: number; lng: number }) => {
      if (!guBoundaries) return
      const district = findDistrictAt(point, guBoundaries)
      if (!district) return
      setMapSelectDistrict(district)
      panToDistrict(district)
    },
    [guBoundaries, panToDistrict],
  )

  // 등록 후(또는 지도 선택 뒤로가기) 검색 화면 복귀 — 오버레이가 다시 마운트된 뒤 포커스
  useEffect(() => {
    if (!pendingSearchFocus || mapSelecting) return
    searchInputRef.current?.focus()
    setPendingSearchFocus(false)
  }, [pendingSearchFocus, mapSelecting])

  // 라우터 state 진입 — 즐겨찾기 "추가"(registerFavorite)·리포트 "지도에서 확인하기"(focusDistrict)
  useEffect(() => {
    const state = location.state as { registerFavorite?: boolean; focusDistrict?: string } | null
    if (!state?.registerFavorite && !state?.focusDistrict) return
    if (state.registerFavorite) {
      setRegisterMode(true)
      setPendingSearchFocus(true)
    }
    // 랭킹 행처럼 "서울 강서구" 형태가 와도 geojson 구명("강서구")에 맞춘다
    if (state.focusDistrict) setPendingFocusDistrict(state.focusDistrict.replace(/^서울\s*/, ''))
    // state 소거 — 새로고침/뒤로가기 시 재진입 방지
    navigate(location.pathname, { replace: true })
  }, [location.state, location.pathname, navigate])

  const handleMyLocation = () => {
    const cached = myLocationRef.current
    // 첫 조회 이후에는 위치 API 응답을 다시 기다리지 않고 저장된 좌표로 즉시 이동한다.
    if (cached) mapRef.current?.panTo(cached.lat, cached.lng)

    const geolocation = navigator.geolocation
    if (!geolocation) {
      if (!cached) showToast('이 브라우저에서는 현재 위치를 사용할 수 없어요.')
      return
    }
    // 연속 탭은 저장된 위치 이동만 수행하고 진행 중인 위치 조회를 중복 생성하지 않는다.
    if (locatingRef.current) return
    locatingRef.current = true

    geolocation.getCurrentPosition(
      ({ coords }) => {
        locatingRef.current = false
        const point = { lat: coords.latitude, lng: coords.longitude }
        myLocationRef.current = point
        setMyLocation((current) =>
          current?.lat === point.lat && current.lng === point.lng ? current : point,
        )
        // 줌 레벨은 건드리지 않고 최신 현 위치로 이동만 한다.
        mapRef.current?.panTo(point.lat, point.lng)
      },
      () => {
        locatingRef.current = false
        if (!myLocationRef.current) showToast('현재 위치를 불러오지 못했어요.')
      },
      { maximumAge: 30_000, timeout: 10_000 },
    )
  }

  return (
    <MobileLayout showBottomTab={!searching && !mapSelecting} scrollable={false}>
      <div className="relative h-full overflow-hidden">
        <div className="absolute inset-0">
          <KakaoMap
            ref={mapRef}
            markers={mapSelecting ? NO_MARKERS : markers}
            onMarkerClick={handleMarkerClick}
            outlines={outlines}
            myLocation={mapSelecting ? null : myLocation}
            pin={
              mapSelecting && mapSelectDistrict ? (centroids?.get(mapSelectDistrict) ?? null) : null
            }
            onMapClick={mapSelecting ? handleRegisterMapClick : handleMapBackgroundClick}
            onReady={handleMapReady}
            className="size-full"
          />
        </div>

        {!mapSelecting && (
          <SearchOverlay
            query={query}
            onQueryChange={handleQueryChange}
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
            savedPlaces={favorites.map((f) => f.district)}
            onPlaceSelect={(district) => {
              const representative = regionByDistrict?.get(district)
              if (representative) selectDistrict(district, representative.regionCode)
              else panToDistrict(district)
            }}
            onEditPlaces={() => navigate('/map/favorites', { viewTransition: true })}
            onAddPlace={() => setRegisterMode(true)}
            registerMode={registerMode}
            onSelectFromMap={handleSelectFromMap}
            inputRef={searchInputRef}
            onFocusChange={(focused) => {
              setSearching(focused)
              // 검색을 닫으면 등록 모드도 해제 — 단 "지도에서 선택" 진입 blur 는 예외
              if (!focused) {
                if (!enteringMapSelect.current) setRegisterMode(false)
                enteringMapSelect.current = false
              }
            }}
            // 검색 모드는 시트·내 위치 버튼(z-10)까지 덮는 풀스크린
            className={cn('absolute inset-x-0 top-0 z-10', searching && 'bottom-0 z-20')}
          />
        )}

        {/* 즐겨찾기 지도에서 선택 모드 — 상단 선택 바 + 하단 확정 CTA */}
        {mapSelecting && (
          <RegisterSelect
            district={mapSelectDistrict}
            onBack={() => {
              setMapSelecting(false)
              setMapSelectDistrict(null)
              setPendingSearchFocus(true)
            }}
            onConfirm={() => mapSelectDistrict && registerDistrict(mapSelectDistrict)}
          />
        )}

        {/* 내 위치 버튼은 시트 바로 위에 붙어 시트 높이 변화를 따라간다 — 래퍼는 지도 조작을 막지 않게 클릭 통과 */}
        {!mapSelecting && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col">
            {!sheetExpanded && !quarterSheetOpen && (
              <MyLocation
                onClick={handleMyLocation}
                className="pointer-events-auto mr-5 mb-3 self-end"
              />
            )}
            <RankingSheet
              title={categoryView.title}
              tabs={categoryView.tabs}
              order={order}
              onOrderChange={setOrder}
              rows={ranking.data?.rows ?? []}
              averagePeriod={ranking.data?.averagePeriod}
              onRowClick={(row) => selectDistrict(row.name.replace(/^서울\s*/, ''), row.regionCode)}
              detail={detailRegionCode !== null ? detail.data : null}
              expanded={sheetExpanded}
              onExpandedChange={setSheetExpanded}
              isPending={ranking.isPending}
              isError={ranking.isError}
              onRetry={() => void ranking.refetch()}
              className="pointer-events-auto"
            />
          </div>
        )}

        {/* 등록 완료 토스트 (Figma 257:9468) — 검색 화면(z-20) 위 */}
        {toast && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center px-5">
            <Toast className={toastClosing ? 'animate-toast-out' : 'animate-toast-in'}>
              {toast}
            </Toast>
          </div>
        )}

        {/* 구독 전 잠금 — 지도·검색(z-20)·토스트(z-30)까지 전부 덮는다 */}
        {locked && (
          <PaywallLock
            className="absolute inset-0 z-40"
            onUpgrade={() => navigate('/my/subscription', { viewTransition: true })}
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
