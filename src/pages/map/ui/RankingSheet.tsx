import { useRef, useState, type PointerEvent } from 'react'
import { Tabs, Spinner, ErrorRetry } from '@/shared/ui'
import { DistrictRankRow } from '@/entities/district'
import { cn } from '@/shared/lib/cn'
import type { RankingOrder } from '@/entities/region'
import type { RankingRow } from '../model/useDeclineRanking'

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
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
}

/**
 * 쇠퇴 등급 랭킹 바텀시트 (Figma: 지도 홈 596:23182).
 * 지도 위에 상시 떠 있는 비모달 시트 — 접힘(핸들+헤더)/펼침(탭+Top5) 두 상태.
 * 핸들·헤더를 탭하거나 위/아래로 끌어 전환한다.
 */
export function RankingSheet({
  order,
  onOrderChange,
  rows,
  onRowClick,
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

  const renderBody = () => {
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
      aria-label="쇠퇴 등급 랭킹"
      className={cn('flex flex-col rounded-t-[20px] bg-white shadow-upper', className)}
    >
      {/* 핸들 + 헤더 — 탭/드래그로 펼침·접힘 */}
      <button
        type="button"
        aria-label="쇠퇴 등급 랭킹 펼침/접힘"
        aria-expanded={expanded}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className="flex w-full cursor-grab touch-none flex-col text-left active:cursor-grabbing"
      >
        <span className="flex h-[26px] w-full items-center justify-center">
          <span className="h-1.5 w-[50px] rounded-full bg-gray-90" />
        </span>
        <span className="flex w-full flex-col gap-0.5 border-b border-gray-90 px-5 pb-4">
          <span className="text-title-s-semibold text-gray-900">쇠퇴 등급</span>
          <span className="text-body-l-medium text-gray-500">서울 전체</span>
        </span>
      </button>

      {/* 본문 — grid rows 0fr→1fr 로 높이 전환 애니메이션 */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-2 p-5">
            <Tabs
              options={ORDER_TABS}
              value={order}
              onChange={(value) => onOrderChange(value as RankingOrder)}
            />
            {renderBody()}
          </div>
        </div>
      </div>
    </section>
  )
}
