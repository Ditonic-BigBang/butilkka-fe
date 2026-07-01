import { cn } from '@/shared/lib/cn'

/**
 * 아웃라인 버튼 (Figma: Button수정 286:7430).
 * 작은 보조 액션 버튼 — 흰 배경 + `gray-100` 테두리, `gray-700` 텍스트. "수정" 등 짧은 라벨용.
 */
export function OutlineButton({
  className,
  type = 'button',
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-10 border border-gray-100 bg-white px-3 py-1 text-body-m-semibold text-gray-700 transition-colors hover:bg-gray-70 active:bg-gray-90 disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    />
  )
}
