import { cn } from '@/shared/lib/cn'

/**
 * 정적 카테고리 태그 (Figma: Category Chip_업종).
 * 선택 불가한 라벨 — 업종·분류 표시용. orange-50 배경 / orange-500 텍스트.
 */
export function Tag({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-max bg-orange-50 px-3 py-1 text-caption-l-medium text-orange-500',
        className,
      )}
      {...props}
    />
  )
}
