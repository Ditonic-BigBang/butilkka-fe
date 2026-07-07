import { useState } from 'react'
import CloseSm from '~icons/ci/close-sm'
import { cn } from '@/shared/lib/cn'

type OutlinedInputProps = {
  value: string
  placeholder?: string
  /** 입력 모드: 값 변경. (주면 input 으로 렌더 — 예: 가게 이름) */
  onChange?: (value: string) => void
  /** 트리거 모드: 탭 시 실행. (onChange 없이 주면 button 으로 렌더 — 예: 가게 위치 → 주소 검색 이동) */
  onClick?: () => void
  /** 트리거 완료 상태: 보조 라인. (주면 2줄 — value=도로명(medium) / subValue=지번(regular)) */
  subValue?: string
  className?: string
}

// 공통 필드 셸 — 흰 배경 + 테두리(포커스 시 진해짐) · 48px · radius-8 (Figma List_S 301:5601)
const FIELD =
  'flex h-12 w-full items-center gap-2 rounded-8 border bg-white px-4 text-left transition-colors'

/**
 * 아웃라인(테두리) 필드 (Figma: List_S 301:5601). 포커스 시 테두리 진해짐(gray-100 → gray-600).
 * - **입력 모드** (`onChange`): 텍스트 입력, 값 있으면 우측 지우기(✕). (예: 가게 이름)
 * - **트리거 모드** (`onChange` 없이 `onClick`): 버튼으로 렌더, 탭 시 이동. (예: 가게 위치 → 주소 검색)
 * - **트리거 완료** (`subValue`): 2줄 — 도로명(value, medium) + 지번(subValue, regular), rounded-10.
 * 값 gray-900 / placeholder gray-500.
 */
export function OutlinedInput({
  value,
  onChange,
  onClick,
  subValue,
  placeholder,
  className,
}: OutlinedInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const borderCls = focused ? 'border-gray-600' : 'border-gray-100'

  // 트리거 완료 (주소 선택됨) → 2줄: 도로명(medium) + 지번(regular)
  if (!onChange && subValue) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full flex-col gap-1 rounded-10 border border-gray-100 bg-white px-4 py-3 text-left',
          className,
        )}
      >
        <span className="w-full truncate text-body-l-medium text-gray-900">{value}</span>
        <span className="w-full truncate text-body-m-regular text-gray-500">{subValue}</span>
      </button>
    )
  }

  // 트리거 모드 (onChange 없음) → 버튼
  if (!onChange) {
    return (
      <button
        type="button"
        onClick={onClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(FIELD, borderCls, className)}
      >
        <span
          className={cn(
            'flex-1 truncate text-body-l-regular',
            hasValue ? 'text-gray-900' : 'text-gray-500',
          )}
        >
          {hasValue ? value : placeholder}
        </span>
      </button>
    )
  }

  // 입력 모드 → input + 포커스 시 값 있으면 지우기(✕)
  return (
    <div className={cn(FIELD, borderCls, className)}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-body-l-regular text-gray-900 placeholder:text-gray-500 focus:outline-none"
      />
      {focused && hasValue && (
        <button
          type="button"
          aria-label="지우기"
          // mousedown 기본동작 막아 blur 전에 clear 가 처리되게
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange('')}
          className="flex size-5 shrink-0 items-center justify-center rounded-max bg-gray-300 text-white"
        >
          <CloseSm aria-hidden className="size-3.5" />
        </button>
      )}
    </div>
  )
}
