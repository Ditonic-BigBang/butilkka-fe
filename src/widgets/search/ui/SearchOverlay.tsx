import { useState } from 'react'
import AddPlusCircle from '~icons/ci/add-plus-circle'
import MapIcon from '~icons/ci/map'
import LocationPin from '~icons/ci/location'
import { FilterChip, SearchInput } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { SearchFilter } from '../model/filters'
import { SearchResultItem } from './SearchResultItem'

export type SearchResult = { id: string; label: string }

type SearchOverlayProps = {
  query: string
  onQueryChange: (query: string) => void
  /** 상단 필터 (미포커스) */
  filters: SearchFilter[]
  selectedFilter?: string
  onFilterSelect?: (key: string) => void
  /** 검색 결과 (포커스 + 검색어) */
  results?: SearchResult[]
  onResultSelect?: (id: string) => void
  /** 즐겨찾는 지역 (포커스 + 빈값 → 있으면 목록, 없으면 등록 안내) */
  savedPlaces?: string[]
  onEditPlaces?: () => void
  onAddPlace?: () => void
  /** 즐겨찾기 등록 모드 (placeholder 변경 + "지도에서 선택") */
  registerMode?: boolean
  onSelectFromMap?: () => void
  /** 검색 모드(포커스) 전환 알림 — 페이지가 풀스크린 전환·하단 탭 숨김에 사용 */
  onFocusChange?: (focused: boolean) => void
  className?: string
}

const ACTION_ROW = 'flex items-center gap-1 px-0.5 text-gray-400'

// 안정적 참조(기본값 재생성 방지)
const NO_RESULTS: SearchResult[] = []
const NO_PLACES: string[] = []

// input blur 전에 클릭이 처리되게 (mousedown 기본동작 막기)
const keepFocus = (e: React.MouseEvent) => e.preventDefault()

/**
 * 지도 상단 검색 오버레이 (Figma: Search 257:7191, 6개 상태).
 * SearchInput + 상태별 콘텐츠:
 * - 미포커스 → 필터칩 행(Map Filter)
 * - 포커스+검색어 → 검색 결과(Searching)
 * - 포커스+빈값 → 즐겨찾기 목록(Myplaces) / 등록 안내(1st_Visitor) / 지도에서 선택(register)
 */
export function SearchOverlay({
  query,
  onQueryChange,
  filters,
  selectedFilter,
  onFilterSelect,
  results = NO_RESULTS,
  onResultSelect,
  savedPlaces = NO_PLACES,
  onEditPlaces,
  onAddPlace,
  registerMode = false,
  onSelectFromMap,
  onFocusChange,
  className,
}: SearchOverlayProps) {
  const [focused, setFocusedState] = useState(false)
  const setFocused = (next: boolean) => {
    setFocusedState(next)
    onFocusChange?.(next)
  }

  const exitSearch = () => {
    onQueryChange('')
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  const renderBelow = () => {
    // 미포커스 → 필터칩 가로스크롤
    if (!focused) {
      return (
        <div
          // 데스크톱: 세로 휠 → 수평 스크롤 (모바일 터치 스와이프는 기본 동작)
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY
          }}
          className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((f) => (
            <FilterChip
              key={f.key}
              caret={f.caret}
              selected={f.selected ?? selectedFilter === f.key}
              onClick={() => onFilterSelect?.(f.key)}
              className="shrink-0"
            >
              {f.label}
            </FilterChip>
          ))}
        </div>
      )
    }
    // 포커스 + 검색어 → 결과
    if (query.trim()) {
      return (
        <div className="flex flex-col gap-3 px-5">
          {results.map((r) => (
            <SearchResultItem
              key={r.id}
              label={r.label}
              query={query}
              onMouseDown={keepFocus}
              // 결과 선택 = 지도로 복귀 — 풀스크린 검색 모드도 함께 끝낸다
              onClick={() => {
                onResultSelect?.(r.id)
                exitSearch()
              }}
            />
          ))}
        </div>
      )
    }
    // 포커스 + 빈값 → 등록 모드 → 지도에서 선택
    if (registerMode) {
      return (
        <div className="px-5">
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={onSelectFromMap}
            className={ACTION_ROW}
          >
            <MapIcon aria-hidden className="size-5 shrink-0" />
            <span className="text-body-m-medium">지도에서 선택</span>
          </button>
        </div>
      )
    }
    // 포커스 + 빈값 → 저장된 즐겨찾기 있으면 목록 + 편집
    if (savedPlaces.length > 0) {
      return (
        <div className="flex w-full items-center justify-between px-5">
          <div className="flex min-w-0 items-center gap-3.5">
            {savedPlaces.map((place) => (
              <span key={place} className="flex shrink-0 items-center gap-1">
                <LocationPin aria-hidden className="size-[22px] shrink-0 text-orange-500" />
                <span className="text-body-m-medium text-gray-500">{place}</span>
              </span>
            ))}
          </div>
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={onEditPlaces}
            className="shrink-0 text-body-m-regular text-gray-400"
          >
            편집
          </button>
        </div>
      )
    }
    // 포커스 + 빈값 → 즐겨찾기 없음 → 등록 안내
    return (
      <div className="px-5">
        <button type="button" onMouseDown={keepFocus} onClick={onAddPlace} className={ACTION_ROW}>
          <AddPlusCircle aria-hidden className="size-5 shrink-0" />
          <span className="text-body-m-regular">즐겨찾는 지역 등록</span>
        </button>
      </div>
    )
  }

  return (
    <div
      // 포커스 전환은 검색 input 기준만 (필터칩 등 다른 버튼 클릭에 반응하지 않게)
      onFocus={(e) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') setFocused(true)
      }}
      onBlur={(e) => {
        if (
          (e.target as HTMLElement).tagName === 'INPUT' &&
          !e.currentTarget.contains(e.relatedTarget as Node | null)
        ) {
          setFocused(false)
        }
      }}
      className={cn(
        'flex w-full flex-col',
        // 포커스 시엔 풀스크린 흰 검색 화면(지도 - 검색시 257:7104), 평상시엔 투명 — 칩 행 뒤로 지도가 비친다
        focused && 'h-full bg-white',
        className,
      )}
    >
      {/* 상단 검색 시트 — 풀스크린 흰 배경 위에 그림자로 경계만 표시 */}
      <div
        className={cn(
          'flex w-full flex-col',
          focused ? 'gap-4 bg-white pb-4 shadow-[0_2px_10px_rgba(0,0,0,0.1)]' : 'gap-2.5',
        )}
      >
        <div
          className={cn(
            'w-full px-5 pt-4',
            !focused && 'bg-white pb-3 shadow-[0_2px_2px_rgba(0,0,0,0.05)]',
          )}
        >
          <SearchInput
            value={query}
            onChange={onQueryChange}
            onBack={exitSearch}
            placeholder={registerMode ? '즐겨찾는 지역으로 등록할 구 검색' : undefined}
          />
        </div>
        {renderBelow()}
      </div>
    </div>
  )
}
