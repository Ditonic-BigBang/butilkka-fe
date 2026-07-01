import Search from '~icons/ci/search'
import { cn } from '@/shared/lib/cn'
import { highlight } from '../lib/highlight'

type SearchResultItemProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  /** 결과 전체 라벨 (예: 서울 서대문구) */
  label: string
  /** 강조할 검색어 (매칭 부분만 진하게) */
  query?: string
}

/**
 * 검색 결과 행 (Figma: Search - Searching 결과 아이템).
 * gray-70 원 안의 🔍 + 라벨. 검색어 매칭 부분은 gray-900, 나머지는 gray-500.
 */
export function SearchResultItem({
  label,
  query,
  className,
  type = 'button',
  ...props
}: SearchResultItemProps) {
  const parts = highlight(label, query)
  return (
    <button
      type={type}
      className={cn('flex w-full items-center gap-3.5 text-left', className)}
      {...props}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-max bg-gray-70">
        <Search aria-hidden className="size-5 text-gray-500" />
      </span>
      <span className="text-body-l-medium text-gray-500">
        {parts.map((p) =>
          p.match ? (
            <span key={p.key} className="text-gray-900">
              {p.text}
            </span>
          ) : (
            <span key={p.key}>{p.text}</span>
          ),
        )}
      </span>
    </button>
  )
}
