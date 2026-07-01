import { cn } from '@/shared/lib/cn'

/**
 * 드롭다운 목록 컨테이너 (Figma: Dropdown_M 267:5719).
 * 흰 카드(rounded-12 · shadow-card) 안에 `DropdownOption` 들을 세로로 배치.
 * 폭은 기본 w-40(160) — 트리거에 맞추려면 className 으로 덮어쓰기.
 */
export function Dropdown({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-40 flex-col overflow-hidden rounded-12 bg-white shadow-card',
        className,
      )}
      {...props}
    />
  )
}
