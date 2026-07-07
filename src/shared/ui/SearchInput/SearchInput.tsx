import { useState } from 'react'
import Search from '~icons/ci/search'
import ChevronLeft from '~icons/ci/chevron-left'
import CloseSm from '~icons/ci/close-sm'
import { cn } from '@/shared/lib/cn'

type SearchInputProps = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
  /** 포커스 시 좌측 ‹ 클릭 (검색 취소/뒤로) */
  onBack?: () => void
}

/**
 * 검색 입력 (Figma: Search Bar 176:2650 · Default/Selected/Typing/Result).
 * controlled input — 값 있으면 우측 ✕(clear).
 * 좌측 아이콘: 기본은 🔍 유지(주소 검색 446:21470), `onBack` 을 넘긴 화면(지도 검색 오버레이)만
 * 포커스 시 🔍→‹(검색 취소)로 전환.
 * 검색 *동작*(쿼리·결과)은 상위 feature 가 처리, 여기는 입력 UI 만.
 */
export function SearchInput({
  value,
  onChange,
  onBack,
  placeholder = '상권 검색 (예: 마포구, 서대문구)',
  className,
  ...props
}: SearchInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  // 값 없으면 옅게(gray-300), 있으면 진하게(gray-600) — Figma Default/Selected vs Typing/Result
  const iconColor = hasValue ? 'text-gray-600' : 'text-gray-300'

  return (
    <div
      className={cn('flex h-12 w-full items-center gap-2.5 rounded-8 bg-gray-70 px-4', className)}
    >
      {focused && onBack ? (
        <button
          type="button"
          aria-label="검색 취소"
          // mousedown 기본동작 막아 input blur 전에 클릭이 처리되게
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBack}
          className="shrink-0"
        >
          <ChevronLeft aria-hidden className={cn('size-6', iconColor)} />
        </button>
      ) : (
        <Search aria-hidden className={cn('size-6 shrink-0', iconColor)} />
      )}

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-body-l-medium text-gray-900 placeholder:font-normal placeholder:text-gray-300 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />

      {hasValue && (
        <button
          type="button"
          aria-label="지우기"
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
