import { tv, type VariantProps } from '@/shared/lib/tv'
import ChevronDown from '~icons/ci/chevron-down'

const filterChip = tv({
  base: 'inline-flex h-9 items-center justify-center gap-1 rounded-max border px-[14px] text-body-m-medium whitespace-nowrap transition-colors select-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
  variants: {
    selected: {
      true: 'border-orange-600 bg-orange-10 text-orange-600',
      false: 'border-gray-100 bg-white text-gray-900',
    },
    // 우측 캐럿(기간/드롭다운형 필터) → 오른쪽 여백 축소
    caret: { true: 'pr-2', false: '' },
  },
  defaultVariants: { selected: false, caret: false },
})

type FilterChipProps = Omit<React.ComponentProps<'button'>, 'children'> &
  VariantProps<typeof filterChip> & { children: React.ReactNode }

/**
 * 필터 바 칩 (Figma: Filter Chip 176:2563).
 * 필터 바에서 켜고 끄는 pill 칩. `selected` 시 오렌지 강조.
 * `caret` → 우측 캐럿(▼), 기간/드롭다운형 필터에. 단일 선택 버튼은 `PeriodChip`.
 */
export function FilterChip({
  selected,
  caret,
  children,
  className,
  type = 'button',
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected ?? undefined}
      className={filterChip({ selected, caret, className })}
      {...props}
    >
      {children}
      {caret && <ChevronDown aria-hidden className="size-6 shrink-0" />}
    </button>
  )
}
