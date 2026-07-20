import { useEffect, useState } from 'react'
import { Sparkle } from '@/entities/report'

/** 생성 단계 문구 — 순차 전환, 마지막 유지 */
const STEPS = [
  '상권 데이터를 수집하고 있어요',
  '유동인구·공실률을 분석하고 있어요',
  '유사 사례와 대조하고 있어요',
  'AI가 리포트를 작성하고 있어요',
]
const STEP_INTERVAL_MS = 3000
/** 생성이 평소(10~15초)보다 길어지면 안심 문구로 교체 */
const LONG_WAIT_MS = 20000
const LONG_WAIT_CAPTION = '거의 다 됐어요. 조금만 더 기다려주세요'

/**
 * AI 리포트 생성 연출 — 첫 리포트·구 변경 직후처럼 `/reports/latest` 가 10~15초
 * 동기 생성하는 동안 스켈레톤 대신 표시 (판별은 useReportLoadingView).
 * 스켈레톤과 같은 컨테이너 패딩·카드 형태라 페이드 전환 시 요소가 튀지 않는다.
 */
export function ReportGenerating() {
  const [step, setStep] = useState(0)
  const [longWait, setLongWait] = useState(false)

  useEffect(() => {
    const stepTimer = setInterval(
      () => setStep((i) => Math.min(i + 1, STEPS.length - 1)),
      STEP_INTERVAL_MS,
    )
    const longTimer = setTimeout(() => setLongWait(true), LONG_WAIT_MS)
    return () => {
      clearInterval(stepTimer)
      clearTimeout(longTimer)
    }
  }, [])

  const caption = longWait ? LONG_WAIT_CAPTION : STEPS[step]

  return (
    <div className="px-5 pt-1 pb-6">
      <div className="flex animate-fade-up flex-col items-center rounded-14 bg-white px-5 py-12 text-center">
        {/* 스파클 클러스터 — 큰 ✦ + 작은 ✦ 시차 펄스 */}
        <div className="relative text-orange-500">
          <Sparkle className="size-10 motion-safe:animate-pulse" />
          <Sparkle className="absolute -top-1 -right-3 size-4 text-orange-300 [animation-delay:600ms] motion-safe:animate-pulse" />
        </div>
        <h2 className="mt-5 text-title-s-semibold text-gray-900">
          이 지역 리포트를 생성하고 있어요
        </h2>
        {/* aria-live 노드는 유지하고 안쪽만 key 리마운트 — 문구 전환마다 페이드 */}
        <p aria-live="polite" className="mt-2 text-body-m-regular text-gray-500">
          <span key={caption} className="block animate-fade-up">
            {caption}
          </span>
        </p>
        {/* 유사 진행 바 — ScoreCard 게이지와 같은 트랙·채움 문법 */}
        <div className="mt-8 h-2.5 w-full max-w-60 overflow-hidden rounded-full bg-gray-90">
          <div className="h-full w-[90%] animate-generating-progress rounded-full bg-orange-500" />
        </div>
        <p className="mt-3 text-caption-l-regular text-gray-400">보통 10~15초 정도 걸려요</p>
      </div>
    </div>
  )
}
