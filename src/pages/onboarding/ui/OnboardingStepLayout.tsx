import type { ReactNode } from 'react'
import { GNB } from '@/widgets/mobile-layout'
import { CTA } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type OnboardingStepLayoutProps = {
  /** 스텝 타이틀 — `\n` 으로 줄바꿈 (Figma 24px semibold) */
  title: string
  /** 타이틀 아래 보조 설명 (Figma 16px medium gray-400) */
  subtitle?: string
  /** 뒤로가기 (기본 표시) */
  onBack?: () => void
  showBack?: boolean
  /** 하단 CTA 라벨 (기본 '다음') */
  cta?: string
  ctaDisabled?: boolean
  onCta?: () => void
  children?: ReactNode
  /** 본문 영역 클래스 override (기본 px-5 pt-10) */
  contentClassName?: string
}

/**
 * 온보딩 스텝 공통 레이아웃 (Figma: [1-2] 온보딩 ver.3 프레임 공통 구조).
 * GNB(뒤로만) → 타이틀 블록(p-5 · 타이틀/서브 gap-2) → 본문(40px 아래, 스크롤) → 하단 CTA.
 * MobileLayout(main 스크롤) 안에서 min-h-full 로 CTA 를 바닥에 고정한다.
 */
export function OnboardingStepLayout({
  title,
  subtitle,
  onBack,
  showBack = true,
  cta = '다음',
  ctaDisabled = false,
  onCta,
  children,
  contentClassName,
}: OnboardingStepLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <GNB showBack={showBack} showSettings={false} onBack={onBack} />

      {/* 타이틀 블록 */}
      <div className="flex flex-col gap-2 p-5">
        <h1 className="text-title-m-semibold whitespace-pre-line text-gray-900">{title}</h1>
        {subtitle && <p className="text-body-l-medium text-gray-400">{subtitle}</p>}
      </div>

      {/* 본문 */}
      <div className={cn('flex-1 px-5 pt-10', contentClassName)}>{children}</div>

      <CTA disabled={ctaDisabled} onClick={onCta}>
        {cta}
      </CTA>
    </div>
  )
}
