import { cn } from '@/shared/lib/cn'

type Direction = 'up' | 'down' | 'same'

type ChangeIndicatorProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** 증감 방향 — up(상승) · down(하락) · same(유지) */
  direction?: Direction
}

// 한국 증시 관례: 상승 = 빨강, 하락 = 파랑 (Figma Updown 251:3365)
const COLOR: Record<Direction, string> = {
  up: 'text-status-red',
  down: 'text-info-blue',
  same: 'text-gray-400',
}
const LABEL: Record<Direction, string> = { up: '상승', down: '하락', same: '변동 없음' }

/**
 * 증감 지표 화살표 (Figma: Updown 251:3365).
 * 지표의 상승(▲빨강)·하락(▼파랑)·유지(–회색)를 표시. 숫자와 나란히 조합해 사용.
 */
export function ChangeIndicator({ direction = 'same', className, ...props }: ChangeIndicatorProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center', COLOR[direction], className)}
      {...props}
    >
      {direction === 'same' ? (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
          <rect x="1" y="4.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      ) : (
        <svg
          width="12"
          height="10"
          viewBox="0 0 12 10"
          fill="currentColor"
          aria-hidden
          className={direction === 'down' ? 'rotate-180' : undefined}
        >
          <path d="M6 0L12 10H0Z" />
        </svg>
      )}
      <span className="sr-only">{LABEL[direction]}</span>
    </span>
  )
}
