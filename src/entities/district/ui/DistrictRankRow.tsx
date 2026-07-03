import { ChangeIndicator } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type DistrictRankRowProps = {
  /** 순위 */
  rank: number
  /** 지역명 (예: "서울 서대문구") */
  name: string
  /** 등급 문자 (예: "E") */
  grade: string
  /** 증감 방향 화살표 — 없으면 표시 안 함 */
  direction?: 'up' | 'down' | 'same'
  onClick?: () => void
  className?: string
}

/**
 * 순위 지역 리스트 행 (Figma: Bottom Sheet All 176:2892).
 * 순위 뱃지 + 지역명 + 등급 + 증감 화살표(ChangeIndicator). 랭킹 리스트에서 divide-y 로 구분.
 */
export function DistrictRankRow({
  rank,
  name,
  grade,
  direction,
  onClick,
  className,
}: DistrictRankRowProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 py-2 text-left',
        onClick && 'transition-colors',
        className,
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-8 bg-orange-10 text-body-m-medium text-key">
        {rank}
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate text-body-l-medium text-gray-900">{name}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="flex items-end gap-0.5 text-body-l-medium">
            <span className="text-gray-900">{grade}</span>
            <span className="text-gray-500">등급</span>
          </span>
          {direction && <ChangeIndicator direction={direction} />}
        </span>
      </span>
    </Comp>
  )
}
