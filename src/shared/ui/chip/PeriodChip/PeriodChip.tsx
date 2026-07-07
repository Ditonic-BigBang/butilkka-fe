import { tv, type VariantProps } from '@/shared/lib/tv'

const periodChip = tv({
  base: 'inline-flex w-[85px] items-center justify-center rounded-8 border px-[10px] py-3 text-body-l-medium whitespace-nowrap transition-colors select-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
  variants: {
    selected: {
      // 선택: key 1.4px 테두리 + orange-10 배경
      true: 'border-[1.4px] border-key bg-orange-10 text-key',
      false: 'border-gray-100 bg-white text-gray-400',
    },
  },
  defaultVariants: { selected: false },
})

type PeriodChipProps = Omit<React.ComponentProps<'button'>, 'children'> &
  VariantProps<typeof periodChip> & { children: React.ReactNode }

/**
 * 기간(분기) 단일 선택 버튼 (Figma: 분기 선택 353:9059).
 * 여러 개 중 하나만 선택하는 네모형 버튼 (1분기·2분기…). 필터 바 칩은 `FilterChip`.
 */
export function PeriodChip({
  selected,
  children,
  className,
  type = 'button',
  ...props
}: PeriodChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected ?? undefined}
      className={periodChip({ selected, className })}
      {...props}
    >
      {children}
    </button>
  )
}
