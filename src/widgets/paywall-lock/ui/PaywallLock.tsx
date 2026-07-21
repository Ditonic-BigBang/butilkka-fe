import type { ReactNode } from 'react'
import { ReportPaywallCard } from '@/entities/report'
import { cn } from '@/shared/lib/cn'

type PaywallLockProps = {
  /**
   * 블러 배경으로 깔 내용 (리포트 본문·스켈레톤).
   * 없으면 뒤에 이미 그려진 화면을 backdrop-blur 로 흐린다 (지도).
   */
  children?: ReactNode
  /** 잠금 카드 타이틀 — 화면별 카피 (기본은 리포트용) */
  title?: string
  /** 잠금 카드 안내문 — 화면별 카피 (기본은 리포트용) */
  description?: string
  /** "확인하러 가기" — 구독 요금제 화면 이동 */
  onUpgrade?: () => void
  className?: string
}

/**
 * 구독(리포트 PRO) 전 화면 잠금 레이어 — 리포트·지도가 공유한다.
 * 콘텐츠를 통째로 블러로 덮고 가운데에 결제 유도 카드를 띄운다.
 * 오버레이가 포인터 이벤트를 모두 흡수하므로 아래 지도 제스처·스크롤도 함께 막힌다.
 *
 * 배경 블러 방식은 두 가지:
 * - `children` 있으면 그 내용을 자체 filter 로 흐린다 (블러 가장자리가 투명해지지 않게 살짝 확대)
 * - `children` 없으면 이미 그려진 아래 화면을 backdrop-filter 로 흐린다
 */
export function PaywallLock({
  children,
  title,
  description,
  onUpgrade,
  className,
}: PaywallLockProps) {
  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      {children ? (
        // -top-6: 첫 카드의 위 모서리를 클립 밖으로 밀어내 헤더와의 경계에 가로선이 생기지 않게
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 scale-[1.03] blur-[7px] select-none"
        >
          {children}
        </div>
      ) : null}
      {/* 스크림 — children 이 없으면 backdrop-filter 로 아래 화면까지 흐린다 */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0',
          children ? 'bg-gray-70/35' : 'bg-gray-70/40 backdrop-blur-[7px]',
        )}
      />
      {/* 위·아래 끝을 배경색으로 녹여 잠금 영역이 헤더·하단 탭에서 뚝 끊기지 않게 —
          투명으로 페이드하는 그라데이션이라 sRGB 보간 */}
      {children ? (
        <div
          aria-hidden
          className="absolute inset-0 [background:linear-gradient(to_bottom,#f7f7f7_0%,rgb(247_247_247/0)_15%,rgb(247_247_247/0)_88%,#f7f7f7_100%)]"
        />
      ) : null}
      {/* 카드 — 잠금 영역이 카드보다 짧아도 잘리지 않게 자체 스크롤 */}
      <div className="absolute inset-0 scrollbar-hide flex items-center justify-center overflow-y-auto px-5 py-8">
        <ReportPaywallCard title={title} description={description} onConfirm={onUpgrade} />
      </div>
    </div>
  )
}
