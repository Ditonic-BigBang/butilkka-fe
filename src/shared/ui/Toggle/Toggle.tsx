import { useState } from 'react'
import { cn } from '@/shared/lib/cn'

type ToggleProps = {
  /** 제어 모드: 켜짐 여부 */
  checked?: boolean
  /** 비제어 모드 초기값 */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

/**
 * 토글 스위치 (Figma: Toggle 286:4972).
 * ON = `key` 오렌지(썸 우측) · OFF = `gray-200`(썸 좌측). 제어/비제어 겸용.
 * `role="switch"` + `aria-checked` 로 접근성 대응.
 */
export function Toggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
  ...props
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const isOn = checked ?? internal

  const handleToggle = () => {
    if (disabled) return
    if (checked === undefined) setInternal(!isOn)
    onCheckedChange?.(!isOn)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-max transition-colors disabled:opacity-40',
        isOn ? 'bg-key' : 'bg-gray-200',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-max bg-white transition-all',
          isOn ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}
