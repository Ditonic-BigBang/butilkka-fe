import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { CTA } from '@/shared/ui'
import { reportBenefitIcons } from '@/entities/report'
import { BenefitCard } from './ui/BenefitCard'
import { PlanCard } from './ui/PlanCard'
import { ComparisonTable } from './ui/ComparisonTable'
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

/**
 * 구독 플랜 확인하기 (Figma: [4-9] 요금제 과정 1248:14758).
 * 마이페이지 "리포트 업그레이드 하기" → 진입. 헤더 + 구독 혜택 4종 + 일반 vs 구독 비교표 +
 * 연간/월간 플랜 선택 + "구독 시작하기" CTA. 구독 API 미정이라 CTA는 마이페이지로 복귀.
 */
export default function SubscriptionPage() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual')

  return (
    <MobileLayout showBottomTab={false}>
      <div className="relative flex min-h-full flex-col bg-white">
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
              <span className="text-body-m-semibold text-key">Pro 구독</span>
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-headline-bold whitespace-pre-line text-gray-900">
                {'더 깊은 데이터로\n더 정확한 의사결정을'}
              </h1>
              <p className="text-body-l-medium whitespace-pre-line text-gray-600">
                {'Pro에서 제공하는\n프리미엄 분석 기능을 만나보세요.'}
              </p>
            </div>
          </header>

          {/* 구독 혜택 */}
          <section className="flex flex-col items-center gap-7">
            <SectionHeading
              title="구독 혜택"
              subtitle="한 단계 더 깊은 상권 분석을 경험해보세요."
            />
            <div className="flex w-full flex-col gap-2">
              {BENEFITS.map((benefit) => (
                <BenefitCard key={benefit.label} {...benefit} />
              ))}
            </div>
          </section>

          {/* 실제 혜택 비교 */}
          <section className="flex flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-3">
              <span className="rounded-max bg-orange-50 px-3 py-1 text-body-m-semibold text-key">
                실제 혜택 비교
              </span>
              <SectionHeading
                title="일반 회원 vs 구독 회원"
                subtitle={'구독 회원에게만 제공되는\n프리미엄 기능을 확인해보세요.'}
              />
            </div>
            <ComparisonTable />
          </section>

          {/* 플랜 선택 */}
          <section className="flex flex-col items-center gap-7">
            <SectionHeading
              title={'나에게 맞는 플랜을\n선택해 보세요'}
              subtitle="연간 플랜으로 20% 더 저렴하게 이용해보세요"
            />
            <div className="flex w-full flex-col gap-3">
              <PlanCard
                name="연간"
                price="76,800원"
                pricePrefix="연"
                subPrice="월 6,400원"
                badge="약 20% 절약"
                selected={plan === 'annual'}
                onSelect={() => setPlan('annual')}
              />
              <PlanCard
                name="월간"
                price="8,000원"
                selected={plan === 'monthly'}
                onSelect={() => setPlan('monthly')}
              />
            </div>
          </section>
        </div>

        <CTA onClick={() => navigate('/my/subscription/complete', { state: { plan } })}>
          구독 시작하기
        </CTA>
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
