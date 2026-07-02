import { cn } from '@/shared/lib/cn'
import defaultLogo from '@/shared/assets/logo/logo-default.svg'
import solidLogo from '@/shared/assets/logo/logo-solid.svg'
import whiteLogo from '@/shared/assets/logo/logo-white.svg'

// 배경에 맞춘 색 변형 (색은 디자인 확정값으로 고정 — currentColor 아님)
const SRC = {
  solid: solidLogo, //  솔리드 오렌지 — 흰/밝은 배경
  default: defaultLogo, // 오렌지 + 흰 아웃라인 — 컬러/사진 배경
  white: whiteLogo, //   흰 글자 — 오렌지/어두운 배경 (앱아이콘·스플래시 중앙)
} as const

type LogoProps = Omit<React.ComponentProps<'img'>, 'src' | 'alt'> & {
  variant?: keyof typeof SRC
}

/**
 * 브랜드 로고 "버틸까" (Figma: Logo 558:11717).
 * 배경에 맞춰 variant 선택 — solid(밝은 배경)·default(컬러 배경)·white(오렌지/어두운 배경).
 * 크기는 className 높이(`h-*`)로 제어하고 비율은 자동(w-auto).
 */
export function Logo({ variant = 'solid', className, ...props }: LogoProps) {
  return (
    <img src={SRC[variant]} alt="버틸까" className={cn('block h-8 w-auto', className)} {...props} />
  )
}
