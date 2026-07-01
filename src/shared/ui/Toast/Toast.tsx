import { cn } from '@/shared/lib/cn'

/**
 * 토스트 (Figma: Toast 373:10078).
 * 하단에 잠깐 뜨는 안내 바 — `bg-gray-800` 다크 + 흰 텍스트. 표시/자동닫힘은 부모가 제어.
 * `<output>` 이라 암묵적 role="status" + aria-live="polite" 로 스크린리더에 안내.
 */
export function Toast({ className, ...props }: React.ComponentProps<'output'>) {
  return (
    <output
      className={cn(
        'flex w-full items-center rounded-12 bg-gray-800 p-4 text-body-m-regular text-white',
        className,
      )}
      {...props}
    />
  )
}
