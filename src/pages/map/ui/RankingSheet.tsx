import { useRef, useState, type PointerEvent } from 'react'
import { Tabs, Spinner, ErrorRetry } from '@/shared/ui'
import { DistrictRankRow } from '@/entities/district'
import { GradeBody } from '@/widgets/district-sheet'
import { cn } from '@/shared/lib/cn'
import type { RankingOrder } from '@/entities/region'
import type { RankingRow } from '../model/useDeclineRanking'
import type { GradeSheetView } from '../model/useRegionDetail'

const ORDER_TABS = [
  { value: 'top', label: '위험 높은 순' },
  { value: 'bottom', label: '안전한 순' },
]

// 이만큼(px) 끌면 탭이 아닌 드래그로 판정해 펼침/접힘
const DRAG_THRESHOLD = 20

type RankingSheetProps = {
  order: RankingOrder
  onOrderChange: (order: RankingOrder) => void
  rows: RankingRow[]
  /** 순위 행 탭 — 해당 구 쇠퇴등급 상세로 진입 */
  onRowClick?: (row: RankingRow) => void
  /** 선택한 구 상세 — 있으면 랭킹 대신 등급 상세 본문을 그 자리에서 보여준다 */
  detail?: GradeSheetView | null
  onClearDetail?: () => void
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
}

/**
 * 지도 상시 바텀시트 (Figma: 지도 홈 596:23182 · 쇠퇴등급(특정) 176:1140).
 * 접힘(핸들+헤더+탭)/펼침 두 상태 — 핸들·헤더를 탭하거나 위/아래로 끌어 전환.
 * 구 선택 시 시트 높이는 그대로 두고 내용만 랭킹 → 해당 구 등급 상세로 바뀐다.
 */
export function RankingSheet({
  order,
  onOrderChange,
  rows,
  onRowClick,
  detail,
  onClearDetail,
  isPending = false,
  isError = false,
  onRetry,
  className,
}: RankingSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const dragStartY = useRef<number | null>(null)
  const dragged = useRef(false)

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
    setExpanded((v) => !v)
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
            grade={row.grade}
            direction={row.direction}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      aria-label="쇠퇴 등급"
      className={cn('flex flex-col rounded-t-[20px] bg-white shadow-upper', className)}
    >
      {/* 핸들 + 헤더 — 탭/드래그로 펼침·접힘 */}
      <div className="relative w-full">
        <button
          type="button"
          aria-label="쇠퇴 등급 시트 펼침/접힘"
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
            <span className="text-title-s-semibold text-gray-900">쇠퇴 등급</span>
            <span className="text-body-l-medium text-gray-500">
              {detail ? detail.subtitle : '서울 전체'}
            </span>
          </span>
        </button>
        {detail && onClearDetail && (
          <button
            type="button"
            onClick={onClearDetail}
            className="absolute top-[38px] right-5 text-body-m-regular text-gray-400"
          >
            전체 보기
          </button>
        )}
      </div>
      <div className="h-px w-full bg-gray-90" />

      {/* 랭킹 모드는 접힘 상태에서도 정렬 탭까지 노출 */}
      {!detail && (
        <div className="w-full px-5 pt-3 pb-1">
          <Tabs
            options={ORDER_TABS}
            value={order}
            onChange={(value) => onOrderChange(value as RankingOrder)}
          />
        </div>
      )}

      {/* 본문 — grid rows 0fr→1fr 로 높이 전환 애니메이션 */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {detail ? (
            <GradeBody
              type="grade"
              quarter={detail.quarterLabel}
              grade={detail.grade}
              status={detail.status}
              lastGrade={detail.lastGrade}
              trend={detail.trend}
              trendTicks={detail.trendTicks}
            />
          ) : (
            <div className="flex flex-col p-5 pt-2">{renderRankingList()}</div>
          )}
        </div>
      </div>
    </section>
  )
}
