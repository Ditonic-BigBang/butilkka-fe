import { tv, type VariantProps } from '@/shared/lib/tv'

const cta = tv({
  base: 'flex h-13 w-full items-center justify-center rounded-12 text-body-l-semibold text-white transition duration-150 select-none',
  variants: {
    // 비활성 = orange-200 (Figma Variant2). 활성 = key, 누르면 orange-600 + 살짝 눌림.
    disabled: {
      true: 'pointer-events-none bg-orange-200',
      false: 'bg-key active:scale-[0.98] active:bg-orange-600',
    },
  },
  defaultVariants: { disabled: false },
})

type CTAProps = Omit<React.ComponentProps<'button'>, 'disabled'> &
  VariantProps<typeof cta> & { children: React.ReactNode }

/**
 * 화면 하단 고정 주요 액션 바 (Figma: CTA 300:5672).
 * 흰 배경 바 + 오렌지 버튼. 바깥 바는 `pb-safe-bottom-or-3` 로 iOS 홈 인디케이터 영역 확보
 * (Figma 의 검은 홈 인디케이터 바는 렌더링하지 않고 safe-area 로 대체).
 * MobileLayout 의 하단(BottomTab 처럼)에 배치.
 */
export function CTA({ disabled, children, className, type = 'button', ...props }: CTAProps) {
  return (
    <div className="w-full shrink-0 bg-white px-5 pt-3 pb-safe-bottom-or-3">
      <button
        type={type}
        disabled={disabled ?? undefined}
        className={cta({ disabled, className })}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}
