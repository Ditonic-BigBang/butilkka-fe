import { cn } from '@/shared/lib/cn'

type SortTriggerProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  /** 현재 정렬 기준 라벨 (예: 최신순) */
  label: string
  /** 방향 캐럿 — desc(▼) · asc(▲) */
  direction?: 'desc' | 'asc'
}

/**
 * 정렬 트리거 (Figma: Trigger_Sort Dropdown 267:5728).
 * 현재 정렬 라벨 + 방향 캐럿. 클릭 시 정렬 메뉴/방향 전환은 부모가 제어.
 * (Up/down 267:5745 캐럿은 이 컴포넌트에 포함)
 */
export function SortTrigger({
  label,
  direction = 'desc',
  className,
  type = 'button',
  ...props
}: SortTriggerProps) {
  return (
    <button
      type={type}
      className={cn('inline-flex items-center gap-1 text-body-m-medium text-gray-700', className)}
      {...props}
    >
      {label}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 8"
        fill="currentColor"
        aria-hidden
        className={cn('text-gray-300', direction === 'asc' && 'rotate-180')}
      >
        <path d="M1 1.5h10L6 7.5Z" />
      </svg>
    </button>
  )
}
