import CalendarDays from '~icons/ci/calendar-days'
import CloseSm from '~icons/ci/close-sm'
import { cn } from '@/shared/lib/cn'

type TextFieldProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  /** 입력 아래 보조 설명 (예: "추후에 변경할 수 있습니다.") */
  caption?: string
  /** text: 자유 입력(+ 값 있으면 지우기) · date: 캘린더 아이콘, 클릭 시 onPick */
  variant?: 'text' | 'date'
  /** filled: gray-70 채움(온보딩) · outlined: 흰 배경 + 테두리(마이페이지 List_S) */
  appearance?: 'filled' | 'outlined'
  /** date 필드 클릭 시(날짜 피커 열기 등) */
  onPick?: () => void
  disabled?: boolean
  className?: string
}

// 공통 필드 셸 — 48px · radius-8 · 좌우 16px (Figma 온보딩_입력 353:8787 / List_S 301:5613)
const FIELD = 'flex h-12 w-full items-center rounded-8 px-4 text-body-l-regular'

// filled = gray-70 채움(placeholder gray-300) · outlined = 흰 배경 + gray-100 테두리(placeholder gray-500)
const APPEARANCE = {
  filled: { shell: 'bg-gray-70', placeholder: 'text-gray-300' },
  outlined: { shell: 'bg-white border border-gray-100', placeholder: 'text-gray-500' },
} as const

/**
 * 입력 필드 (Figma: 온보딩_입력 353:8787 · List_S 301:5613).
 * 값이 있으면 텍스트 gray-900, 없으면 placeholder(appearance 별 색).
 * - `text`: 자유 입력, 값 있으면 우측 지우기(✕) 버튼
 * - `date`: 우측 캘린더 아이콘(값 있으면 gray-600, 없으면 gray-300), 클릭 시 `onPick`
 * - `appearance`: `filled`(gray-70, 온보딩) · `outlined`(흰+테두리, 마이페이지)
 * `caption` 은 필드 아래 gray-300 14px 로 표시.
 */
export function TextField({
  value = '',
  onChange,
  placeholder,
  caption,
  variant = 'text',
  appearance = 'filled',
  onPick,
  disabled,
  className,
}: TextFieldProps) {
  const hasValue = value.length > 0
  const { shell, placeholder: placeholderColor } = APPEARANCE[appearance]

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {variant === 'date' ? (
        <button
          type="button"
          onClick={onPick}
          disabled={disabled}
          className={cn(FIELD, shell, 'justify-between disabled:opacity-60')}
        >
          <span className={hasValue ? 'text-gray-900' : placeholderColor}>
            {hasValue ? value : placeholder}
          </span>
          <CalendarDays
            aria-hidden
            className={cn('size-6 shrink-0', hasValue ? 'text-gray-600' : 'text-gray-300')}
          />
        </button>
      ) : (
        <div className={cn(FIELD, shell, 'gap-2.5')}>
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-gray-900 focus:outline-none disabled:opacity-60',
              appearance === 'outlined' ? 'placeholder:text-gray-500' : 'placeholder:text-gray-300',
            )}
          />
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="지우기"
              onClick={() => onChange?.('')}
              className="flex size-5 shrink-0 items-center justify-center rounded-max bg-gray-300 text-white"
            >
              <CloseSm aria-hidden className="size-3.5" />
            </button>
          )}
        </div>
      )}
      {caption && <p className="text-body-m-regular text-gray-300">{caption}</p>}
    </div>
  )
}
