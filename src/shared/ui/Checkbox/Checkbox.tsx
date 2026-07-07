import Check from '~icons/ci/check'
import { cn } from '@/shared/lib/cn'

type CheckboxProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
  /** 크기·간격 등 override (기본 size-5 = 20px, 전체동의는 size-[26px]) */
  className?: string
}

/**
 * 체크박스 (Figma: 약관 동의 Interface/Check 285:4662).
 * - 미체크: 흰 배경 · gray-200 테두리 · 옅은 회색 체크
 * - 체크: key(오렌지) 채움 · 흰 체크
 * 네이티브 input 을 투명하게 겹쳐 접근성(포커스·스크린리더) 유지.
 * 크기는 className(size-*)로 조절 — 체크 아이콘은 박스에 비례해서 커진다.
 */
export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled,
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'relative flex size-5 shrink-0 items-center justify-center rounded-4 border transition-colors',
        checked ? 'border-key bg-key text-white' : 'border-gray-200 bg-white text-gray-200',
        disabled && 'opacity-50',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
        className="absolute inset-0 cursor-pointer appearance-none disabled:cursor-default"
      />
      <Check aria-hidden className="size-[85%]" />
    </label>
  )
}
