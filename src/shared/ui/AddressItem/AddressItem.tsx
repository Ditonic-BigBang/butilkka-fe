import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

type AddressItemProps = {
  /** 메인 주소 (예: 도로명 주소) */
  address: string
  /** 주소 유형 뱃지 (예: 도로명 · 지번) */
  badge?: string
  /** 보조 주소 (예: 지번 주소) */
  subAddress?: string
  onClick?: () => void
  className?: string
}

/**
 * 주소 리스트 항목 (Figma: Address_List 353:8931).
 * 흰 배경 · 하단 divider · 탭 가능. 메인 주소(gray-900 14px medium),
 * 아래 뱃지(gray-70 pill) + 보조 주소(gray-500), 우측 chevron(gray-200).
 */
export function AddressItem({ address, badge, subAddress, onClick, className }: AddressItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full press-soft items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4 text-left active:bg-gray-70',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <p className="truncate text-body-m-medium text-gray-900">{address}</p>
        {(badge || subAddress) && (
          <div className="flex min-w-0 items-center gap-1.5">
            {badge && (
              <span className="shrink-0 rounded-4 bg-gray-70 px-1.5 py-0.5 text-caption-l-medium text-gray-400">
                {badge}
              </span>
            )}
            {subAddress && (
              <span className="min-w-0 truncate text-body-m-regular text-gray-500">
                {subAddress}
              </span>
            )}
          </div>
        )}
      </div>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-200" />
    </button>
  )
}
