import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { CTA } from '@/shared/ui'
import { reportBenefitIcons } from '@/entities/report'
import { ProStatusCard } from './ui/ProStatusCard'
import { BenefitRow } from './ui/BenefitRow'
import successIllust from './assets/success.svg'

// 성공 일러스트(success.svg) 팔레트 그대로 — 오렌지·하늘색·노랑
const CONFETTI_COLORS = ['#ff621b', '#ff9058', '#ffbe81', '#8bdaff', '#ffe68c']

/**
 * 진입 시 폭죽 발사 — 성공 일러스트 중앙에서 위로 터진다 (온보딩 완료 스텝과 동일 패턴).
 * 모션 최소화 설정 사용자는 건너뛴다.
 */
function fireConfetti(img: HTMLImageElement | null): ReturnType<typeof setTimeout> | undefined {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

  const rect = img?.getBoundingClientRect()
  const origin = rect
    ? {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height * 0.55) / window.innerHeight,
      }
    : { x: 0.5, y: 0.3 }

  // 큰 한 방 + 잠깐 뒤 잔폭죽 — 조각 적게, ticks 짧게(빨리 사라짐)
  void confetti({
    particleCount: 45,
    spread: 70,
    startVelocity: 45,
    ticks: 120,
    scalar: 1.3,
    origin,
    colors: CONFETTI_COLORS,
  })
  return setTimeout(() => {
    void confetti({
      particleCount: 18,
      spread: 100,
      startVelocity: 30,
      ticks: 100,
      scalar: 1,
      origin,
      colors: CONFETTI_COLORS,
    })
  }, 180)
}

type Plan = 'annual' | 'monthly'

const PLAN_INFO: Record<Plan, { label: string; price: string }> = {
  annual: { label: '연간', price: '76,800원' },
  monthly: { label: '월간', price: '8,000원' },
}

// 이용 중 혜택 4종 — 요금제 과정/3 (설명은 완료 화면용 짧은 문구)
const BENEFITS = [
  {
    icon: reportBenefitIcons.cases,
    title: '실제 유사 사례 제공',
    subtitle: '비슷한 상권의 회복/쇠퇴 사례 확인',
  },
  {
    icon: reportBenefitIcons.strategy,
    title: '내 가게에 맞는 대응 전략 추천',
    subtitle: 'AI 데이터 기반 상권 유지 및 이동 전략 추천',
  },
  {
    icon: reportBenefitIcons.report,
    title: '최대 3년까지 종합 리포트 조회',
    subtitle: '장기적인 상권 흐름 파악',
  },
  {
    icon: reportBenefitIcons.pdf,
    title: '상세 리포트 PDF 다운로드',
    subtitle: '리포트 PDF 저장 및 공유',
  },
]

/** 선택 플랜의 다음 결제일 — 월간 +1개월 / 연간 +1년 */
function nextBillingDate(plan: Plan): string {
  const now = new Date()
  const next = new Date(now)
  if (plan === 'annual') next.setFullYear(now.getFullYear() + 1)
  else next.setMonth(now.getMonth() + 1)
  return `${next.getFullYear()}년 ${next.getMonth() + 1}월 ${next.getDate()}일`
}

/**
 * 구독 완료 (Figma: [4-9] 요금제 과정/3 1256:14584).
 * 구독 시작하기 → 진입(선택 플랜을 state 로 받음, 기본 월간). 성공 일러스트 + 완료 문구 +
 * 리포트 PRO 이용중 요약 + 이용 중 혜택 목록. GNB X·CTA 는 홈으로 이동.
 */
export default function SubscriptionCompletePage() {
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const plan = (routerLocation.state as { plan?: Plan } | null)?.plan ?? 'monthly'
  const { label, price } = PLAN_INFO[plan]
  const illustRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // StrictMode(dev)에선 마운트가 2회라 두 번 터질 수 있음 — 무해, prod 는 1회
    const timer = fireConfetti(illustRef.current)
    return () => clearTimeout(timer)
  }, [])

  const goHome = () => navigate('/', { replace: true })

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        <GNB showBack={false} onClose={goHome} />

        {/* 성공 일러스트 (풀블리드) — 진입 폭죽의 발사 기준점 */}
        <img ref={illustRef} src={successIllust} alt="" aria-hidden className="w-full" />

        {/* pb-4 + CTA 자체 pt-3(12px) = Figma 콘텐츠↔CTA 28px 간격 */}
        <div className="flex flex-1 flex-col px-5 pb-4">
          {/* 완료 문구 */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-title-m-bold whitespace-pre-line text-gray-900">
              {`${label} 구독이\n완료되었어요`}
            </h1>
            <p className="text-body-l-medium whitespace-pre-line text-gray-500">
              {'이제 더 자세한 상권 분석과\n가게에 맞는 대응 전략을 확인할 수 있어요.'}
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-9">
            {/* 리포트 PRO 이용중 요약 */}
            <ProStatusCard nextBilling={nextBillingDate(plan)} price={price} />

            {/* 이용 중 혜택 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-title-s-semibold text-gray-900">이런 혜택을 이용 중이에요</h2>
              <div className="divide-y divide-gray-90 overflow-hidden rounded-14 border border-gray-100">
                {BENEFITS.map((benefit) => (
                  <BenefitRow key={benefit.title} {...benefit} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <CTA onClick={goHome}>혜택 이용하러 가기</CTA>
      </div>
    </MobileLayout>
  )
}
