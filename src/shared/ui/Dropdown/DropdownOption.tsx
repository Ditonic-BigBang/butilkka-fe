import Check from '~icons/ci/check'
import { cn } from '@/shared/lib/cn'

type DropdownOptionProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  /** 선택됨 → 우측 파란 체크 */
  selected?: boolean
  children: React.ReactNode
}

/**
 * 드롭다운 옵션 행 (Figma: Option_Dropdown List 267:5739).
 * `Dropdown` 안에 넣어 사용. `selected` 시 우측에 파란 체크(info-blue).
 */
export function DropdownOption({
  selected,
  children,
  className,
  type = 'button',
  ...props
}: DropdownOptionProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'flex h-12 w-full items-center justify-between px-4 text-body-m-medium text-gray-800 transition-colors hover:bg-gray-70 active:bg-gray-90',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {selected && <Check aria-hidden className="size-6 shrink-0 text-info-blue" />}
    </button>
  )
}
