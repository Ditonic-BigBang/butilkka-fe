import { tv, type VariantProps } from '@/shared/lib/tv'

const smallChip = tv({
  base: 'inline-flex items-center justify-center rounded-6 px-3 py-2 text-caption-l-regular whitespace-nowrap',
  variants: {
    variant: {
      light: 'bg-gray-90 text-gray-500',
      solid: 'bg-gray-700 text-white',
      outline: 'border border-gray-700 text-gray-800',
    },
  },
  defaultVariants: { variant: 'light' },
})

type SmallChipProps = React.ComponentProps<'span'> & VariantProps<typeof smallChip>

/**
 * 작은 칩 (Figma: 칩바_리포트 상세보기 267:5870).
 * 리포트 상세 등에서 쓰는 소형 라벨 — `light`(연회색) · `solid`(다크) · `outline`(테두리).
 * 필터 바 pill 은 `FilterChip`, 오렌지 카테고리 라벨은 `Tag`.
 */
export function SmallChip({ variant, className, ...props }: SmallChipProps) {
  return <span className={smallChip({ variant, className })} {...props} />
}
