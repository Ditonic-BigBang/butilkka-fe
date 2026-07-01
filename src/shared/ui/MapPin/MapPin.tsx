import { cn } from '@/shared/lib/cn'

type MapPinProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** active = 오렌지(현재/선택) · inactive = 다크 */
  variant?: 'active' | 'inactive'
}

// Figma Map Pin 519:11831 — 물방울 채움/테두리 + 바닥 타원 색
const COLOR = {
  active: { fill: 'var(--color-key)', stroke: 'var(--color-orange-700)', base: 'bg-orange-300' },
  inactive: {
    fill: 'var(--color-gray-900)',
    stroke: 'var(--color-orange-400)',
    base: 'bg-orange-600',
  },
} as const

/**
 * 지도 핀 마커 (Figma: Map Pin 519:11831).
 * 물방울 핀 + 흰 깃발 아이콘 + 바닥 그림자. `active`(오렌지) · `inactive`(다크).
 * 실제 Figma SVG 경로를 그대로 사용.
 */
export function MapPin({ variant = 'active', className, ...props }: MapPinProps) {
  const { fill, stroke, base } = COLOR[variant]
  return (
    <div className={cn('relative h-[55px] w-[46px]', className)} {...props}>
      {/* 바닥 타원 (핀이 놓인 자리) */}
      <span
        className={cn(
          'absolute top-[80%] left-1/2 h-[10px] w-[23px] -translate-x-1/2 rounded-[50%]',
          base,
        )}
      />
      {/* 물방울 핀 */}
      <svg
        className="absolute top-[2.04%] right-[7.69%] bottom-[14.28%] left-[10.26%]"
        viewBox="0 0 38.7436 47.0204"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M0.5 18.4527C0.5 31.0347 11.943 41.4395 17.008 45.4286C17.7329 45.9996 18.0997 46.2884 18.6405 46.4349C19.0616 46.5489 19.6814 46.5489 20.1025 46.4349C20.6443 46.2881 21.0085 46.0021 21.7362 45.429C26.8011 41.4399 38.2436 31.0358 38.2436 18.4539C38.2436 13.6923 36.2554 9.12529 32.7162 5.75839C29.1771 2.3915 24.3773 0.5 19.3721 0.5C14.367 0.5 9.56662 2.39179 6.02745 5.75868C2.48828 9.12557 0.5 13.6912 0.5 18.4527Z"
          fill={fill}
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* 깃발 아이콘 */}
      <svg
        className="absolute top-[14.6px] left-[17.5px] h-[15.75px] w-[14px]"
        viewBox="0 0 16 17.7499"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M1 16.7499V12.1011M1 12.1011C6.09091 8.12044 9.90909 16.0817 15 12.101V2.14923C9.90909 6.12993 6.09091 -1.83165 1 2.14905V12.1011Z"
          stroke="var(--color-orange-10)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
