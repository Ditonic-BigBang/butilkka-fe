import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { THEME_COLORS } from '@/shared/lib/themeColors'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { CTA } from '@/shared/ui'
import { reportBenefitIcons } from '@/entities/report'
import { useSubscribe } from './model/useSubscribe'
import { BenefitCard } from './ui/BenefitCard'
import ticketIcon from './assets/pro-ticket.svg'

const BENEFITS = [
  {
    icon: reportBenefitIcons.cases,
    label: '혜택 1',
    title: '실제 유사 사례 제공',
    description:
      '비슷한 상권의 회복/쇠퇴 사례를 통해\n내 상권의 미래를 더 정확히 예측할 수 있어요.',
  },
  {
    icon: reportBenefitIcons.strategy,
    label: '혜택 2',
    title: '내 가게에 맞는 대응 전략 추천',
    description: 'AI가 분석한 데이터를 바탕으로\n상권 유지 및 이동의 대응 전략을 추천해요.',
  },
  {
    icon: reportBenefitIcons.report,
    label: '혜택 3',
    title: '최대 3년까지 종합 리포트 조회',
    description: '과거부터 현재까지의 변화를 확인하고\n장기적인 상권 흐름을 파악할 수 있어요.',
  },
  {
    icon: reportBenefitIcons.pdf,
    label: '혜택 4',
    title: '상세 리포트 PDF 다운로드',
    description: '리포트를 PDF로 저장하여 공유할 수 있어요.',
  },
]

// 이 이내로 하단에 붙어 있으면 "맨 밑" 으로 판정 — 모바일 소수점 scrollTop 오차 흡수
const AT_BOTTOM_EPSILON = 16

/**
 * 구독 플랜 확인하기 (Figma: [4-9] 요금제 과정 1248:14758).
 * 마이페이지 "리포트 업그레이드 하기"·리포트/지도 잠금 카드 → 진입.
 * 헤더 + 결제 혜택 4종 + "구독 시작하기" CTA.
 * CTA 는 하단 플로팅(sticky) — 맨 밑이 아니면 탭 시 끝까지 스크롤, 맨 밑에서 탭하면
 * 구독 확정(POST, 선규격) 후 완료 화면으로 — 세션 갱신으로 잠금이 풀린다.
 *
 * 비교표(ComparisonTable)·플랜 카드(PlanCard)는 화면에서 내렸지만 다시 쓸 수 있어
 * 컴포넌트는 `ui/` 에 그대로 남겨둔다.
 */
export default function SubscriptionPage() {
  const navigate = useNavigate()
  const subscription = useSubscribe()
  const rootRef = useRef<HTMLDivElement>(null)
  // 상단 그라데이션 시작색을 노치·상태바까지 이어 보이게 (Android 상태바 색)
  useThemeColor(THEME_COLORS.subscriptionWarm)

  const handleCtaClick = () => {
    // 스크롤러는 MobileLayout 의 main — 페이지 루트의 부모
    const scroller = rootRef.current?.parentElement
    if (scroller) {
      const remaining = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
      if (remaining > AT_BOTTOM_EPSILON) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
        return
      }
    }
    subscription.mutate(undefined, {
      onSuccess: () => navigate('/my/subscription/complete'),
    })
  }

  return (
    // className: 프레임(노치 영역 포함) 배경을 그라데이션 시작색으로 → iOS 노치가 헤더와 이어짐
    <MobileLayout showBottomTab={false} className="bg-subscription-warm">
      <div ref={rootRef} className="relative flex min-h-full flex-col bg-white">
        {/* 상단 웜 그라데이션 (헤더 배경) — Gradation/3 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[442px] bg-gradation-3" />

        <GNB
          title="구독 플랜 확인하기"
          showSettings={false}
          onBack={() => navigate(-1)}
          className="relative bg-transparent"
        />

        <div className="relative flex flex-col gap-25 px-5 pt-18 pb-6">
          {/* 헤더 */}
          <header className="flex flex-col items-center gap-4 text-center">
            <span className="flex items-center gap-2 rounded-max bg-white px-3 py-1">
              <img src={ticketIcon} alt="" aria-hidden className="size-6" />
              <span className="text-body-m-semibold text-key">데이터 구독</span>
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-headline-bold whitespace-pre-line text-gray-900">
                {'더 깊은 데이터로\n더 정확한 의사결정을'}
              </h1>
              <p className="text-body-l-medium whitespace-pre-line text-gray-600">
                {'데이터를 연간 구독하고\n프리미엄 분석 기능을 만나보세요.'}
              </p>
            </div>
          </header>

          {/* 구독 혜택 */}
          <section className="flex flex-col items-center gap-7">
            <SectionHeading
              title="결제 혜택"
              subtitle="한 단계 더 깊은 상권 분석을 경험해보세요."
            />
            <div className="flex w-full flex-col gap-2">
              {BENEFITS.map((benefit) => (
                <BenefitCard key={benefit.label} {...benefit} />
              ))}
            </div>
          </section>
        </div>

        {/* 플로팅 CTA — 투명 바탕으로 콘텐츠 위에 버튼만 떠서 항상 노출 */}
        <div className="sticky bottom-0 z-10 mt-auto">
          {subscription.isError && (
            <p className="px-5 pt-2 pb-1 text-center text-body-m-medium text-status-red">
              {subscription.error.message}
            </p>
          )}
          <CTA transparent disabled={subscription.isPending} onClick={handleCtaClick}>
            {subscription.isPending ? '구독 처리 중…' : '790,000원 결제하기'}
          </CTA>
        </div>
      </div>
    </MobileLayout>
  )
}

/** 섹션 헤더 — 가운데 정렬 제목 + 설명 (줄바꿈 반영) */
function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-title-s-semibold whitespace-pre-line text-gray-900">{title}</p>
      <p className="text-body-l-medium whitespace-pre-line text-gray-600">{subtitle}</p>
    </div>
  )
}
