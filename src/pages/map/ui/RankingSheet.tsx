import { useRef, useState, type PointerEvent } from 'react'
import { Tabs, Spinner, ErrorRetry } from '@/shared/ui'
import { DistrictRankRow } from '@/entities/district'
import { GradeBody, MetricBody, PeriodSection } from '@/widgets/district-sheet'
import { cn } from '@/shared/lib/cn'
import type { RankingOrder } from '@/entities/region'
import type { RankingRow } from '../model/useRanking'
import type { SheetDetailView } from '../model/useRegionDetail'

// 이만큼(px) 끌면 탭이 아닌 드래그로 판정해 펼침/접힘
const DRAG_THRESHOLD = 20

// 구 선택 상세 본문 — 카테고리에 따라 등급(GradeBody)/지표(MetricBody) 조립
function renderDetail(view: SheetDetailView) {
  if (view.kind === 'grade') {
    return (
      <GradeBody
        type="grade"
        quarter={view.quarterLabel}
        grade={view.grade}
        status={view.status}
        lastGrade={view.lastGrade}
        trend={view.trend}
        trendTicks={view.trendTicks}
      />
    )
  }
  return (
    <MetricBody
      type="metric"
      quarter={view.quarterLabel}
      value={view.value}
      unit={view.unit}
      comparison={view.comparison}
      trend={view.trend}
      trendTicks={view.trendTicks}
      trendUnit={view.trendUnit}
      trendTooltip={(p) => `${p.value.toLocaleString()}${view.unit}`}
      // y축 눈금은 도메인 보간이라 소수가 나온다 — 지표별 축약 라벨 우선, %만 소수 1자리, 나머지는 정수
      yFormatter={
        view.trendAxisLabel ??
        ((v) =>
          view.unit === '%' ? String(Math.round(v * 10) / 10) : Math.round(v).toLocaleString())
      }
      averagePeriod={view.averagePeriod}
    />
  )
}

type RankingSheetProps = {
  /** 시트 헤더 제목 (예: "쇠퇴 등급" · "매출 대비 임대료") */
  title: string
  /** 정렬 탭 라벨 [top, bottom] (예: ["위험 높은 순", "안전한 순"]) */
  tabs: [string, string]
  order: RankingOrder
  onOrderChange: (order: RankingOrder) => void
  rows: RankingRow[]
  /** 랭킹 아래 평균 영업 기간 섹션 (폐업률 — "서울 전체 N년") */
  averagePeriod?: { label: string; years: string }
  /** 순위 행 탭 — 해당 구 상세로 진입 */
  onRowClick?: (row: RankingRow) => void
  /** 선택한 구 상세 — 있으면 랭킹 대신 카테고리별 상세 본문을 그 자리에서 보여준다 (해제는 검색바 ✕) */
  detail?: SheetDetailView | null
  /** 펼침 상태 제어 — 지정 시 controlled (지도 탭으로 접기 등 외부 전환용) */
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
}

/**
 * 지도 상시 바텀시트 (Figma: 지도 홈 596:23182 · 쇠퇴등급(특정) 176:1140 · 지표 255:2413).
 * 접힘(핸들+헤더+탭)/펼침 두 상태 — 핸들·헤더를 탭하거나 위/아래로 끌어 전환.
 * 구 선택 시 시트 높이는 그대로 두고 내용만 랭킹 → 해당 구 상세(등급/지표)로 바뀐다.
 */
export function RankingSheet({
  title,
  tabs,
  order,
  onOrderChange,
  rows,
  averagePeriod,
  onRowClick,
  detail,
  expanded: controlledExpanded,
  onExpandedChange,
  isPending = false,
  isError = false,
  onRetry,
  className,
}: RankingSheetProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expanded = controlledExpanded ?? internalExpanded
  const setExpanded = (next: boolean) => {
    if (controlledExpanded === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }
  const dragStartY = useRef<number | null>(null)
  const dragged = useRef(false)

  const orderTabs = [
    { value: 'top', label: tabs[0] },
    { value: 'bottom', label: tabs[1] },
  ]

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = e.clientY
    dragged.current = false
  }
  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragStartY.current === null) return
    const dy = e.clientY - dragStartY.current
    dragStartY.current = null
    if (dy < -DRAG_THRESHOLD) {
      dragged.current = true
      setExpanded(true)
    } else if (dy > DRAG_THRESHOLD) {
      dragged.current = true
      setExpanded(false)
    }
  }
  const handleClick = () => {
    // 드래그로 이미 전환했으면 뒤따르는 click 은 무시
    if (dragged.current) {
      dragged.current = false
      return
    }
    setExpanded(!expanded)
  }

  const renderRankingList = () => {
    if (isPending) {
      return (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      )
    }
    if (isError && onRetry) {
      return <ErrorRetry message="순위를 불러오지 못했어요." onRetry={onRetry} className="py-6" />
    }
    return (
      <div className="flex flex-col divide-y divide-gray-90">
        {rows.map((row) => (
          <DistrictRankRow
            key={row.rank}
            rank={row.rank}
            name={row.name}
            grade={row.value}
            unit={row.unit}
            direction={row.direction}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      aria-label={title}
      className={cn('flex flex-col rounded-t-[20px] bg-white shadow-upper', className)}
    >
      {/* 핸들 + 헤더 — 탭/드래그로 펼침·접힘 */}
      <div className="relative w-full">
        <button
          type="button"
          aria-label={`${title} 시트 펼침/접힘`}
          aria-expanded={expanded}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          className="flex w-full cursor-grab touch-none flex-col text-left active:cursor-grabbing"
        >
          <span className="flex h-[26px] w-full items-center justify-center">
            <span className="h-1.5 w-[50px] rounded-full bg-gray-90" />
          </span>
          <span className="flex w-full flex-col gap-0.5 px-5 pb-4">
            <span className="text-title-s-semibold text-gray-900">{title}</span>
            <span className="text-body-l-medium text-gray-500">
              {detail ? detail.subtitle : '서울 전체'}
            </span>
          </span>
        </button>
      </div>
      <div className="h-px w-full bg-gray-90" />

      {/* 본문 — 접힘 상태에서도 상단 일부가 보이게 max-height 로 전환.
          랭킹 정렬 탭도 이 안에 두어 전체/구 선택 모드의 접힘 높이가 같다. */}
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-300 ease-out',
          expanded ? 'max-h-[560px]' : 'max-h-[88px]',
        )}
      >
        <div>
          {detail ? (
            renderDetail(detail)
          ) : (
            <>
              <div className="w-full px-5 pt-3 pb-1">
                <Tabs
                  options={orderTabs}
                  value={order}
                  onChange={(value) => onOrderChange(value as RankingOrder)}
                />
              </div>
              <div className="flex flex-col p-5 pt-2">{renderRankingList()}</div>
              {averagePeriod && (
                <>
                  <div className="h-2 w-full bg-gray-70" />
                  <PeriodSection {...averagePeriod} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
