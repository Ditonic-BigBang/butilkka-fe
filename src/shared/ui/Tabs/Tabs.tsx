import { cn } from '@/shared/lib/cn'

type TabOption = { value: string; label: string }

type TabsProps = {
  options: TabOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * 세그먼트 탭 (Figma: Tabs 477:12490).
 * gray-70 트랙(radius-12) 위 균등폭 세그먼트. 활성 = 흰 pill(radius-8) + gray-900,
 * 비활성 = 투명 + gray-400. 14px semibold. 단일 선택(정렬 토글 등).
 */
export function Tabs({ options, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn('flex w-full items-center gap-1 rounded-12 bg-gray-70 p-1.5', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex min-w-px flex-1 items-center justify-center rounded-8 px-2.5 py-1.5 text-body-m-semibold whitespace-nowrap transition-colors',
              active ? 'bg-white text-gray-900' : 'text-gray-400',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
