import { tv, type VariantProps } from '@/shared/lib/tv'

const selectButton = tv({
  base: 'inline-flex h-[50px] w-[169px] items-center justify-center rounded-8 border bg-white px-11 py-2 text-body-l-medium whitespace-nowrap transition-colors disabled:pointer-events-none',
  variants: {
    selected: {
      // 선택: key 2px 테두리 + gray-900 텍스트
      true: 'border-2 border-key text-gray-900',
      false: 'border-[1.6px] border-gray-100 text-gray-600',
    },
    // 비활성(Figma Variant3): opacity-60
    disabled: { true: 'opacity-60', false: '' },
  },
  defaultVariants: { selected: false, disabled: false },
})

type SelectButtonProps = Omit<React.ComponentProps<'button'>, 'disabled'> &
  VariantProps<typeof selectButton> & { children: React.ReactNode }

/**
 * 선택 버튼 (Figma: 업종 353:8975).
 * 업종 등 옵션 중 하나를 고르는 버튼 — `selected`(오렌지 테두리) · `disabled`(흐림).
 * 폭은 Figma 기준 고정(w-169) — 다르게 쓰려면 className 으로 덮어쓰기.
 */
export function SelectButton({
  selected,
  disabled,
  children,
  className,
  type = 'button',
  ...props
}: SelectButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? undefined}
      aria-pressed={selected ?? undefined}
      className={selectButton({ selected, disabled, className })}
      {...props}
    >
      {children}
    </button>
  )
}
