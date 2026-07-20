import { useEffect, useState } from 'react'
import { Sparkle } from '@/entities/report'
import { generatingCaption, generatingHint } from '../model/generatingSteps'

/** 경과 시간 갱신 주기 — 문구 전환(3초)에 비해 충분히 촘촘하다 */
const TICK_MS = 500

/**
 * AI 리포트 생성 연출 — 첫 리포트·구 변경 직후처럼 `/reports/latest` 가 10~15초
 * 동기 생성하는 동안 스켈레톤 대신 표시 (판별은 useReportLoadingView).
 * 헤더·하단 탭은 유지한 채 콘텐츠 영역을 통째로 차지하는 중앙 정렬 전용 화면
 * (토스류 심사·분석 대기 패턴) — 부모가 flex 컬럼일 때 flex-1 로 남은 높이를 채운다.
 *
 * 진행 표시는 마운트가 아니라 `startedAt`(생성 시작 시각) 기준이라,
 * 다른 탭에 갔다 돌아와도 문구·진행 바가 처음으로 되돌아가지 않는다.
 */
export function ReportGenerating({ startedAt }: { startedAt?: number | null }) {
  // 기준 시각 — 재진입이면 과거의 생성 시작 시각, 없으면 지금부터
  const [base] = useState(() => startedAt ?? Date.now())
  // 마운트 시점의 경과 — 진행 바를 그만큼 앞당겨(음수 delay) 이어지는 지점에서 재생한다
  const [initialElapsed] = useState(() => Math.max(0, Date.now() - base))
  const [elapsed, setElapsed] = useState(initialElapsed)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.max(0, Date.now() - base)), TICK_MS)
    return () => clearInterval(timer)
  }, [base])

  const caption = generatingCaption(elapsed)

  return (
    // pb-14: 헤더 높이만큼 시각 중심을 살짝 위로 보정
    <div className="flex flex-1 flex-col items-center justify-center px-5 pb-14 text-center">
      {/* 스파클 클러스터 — 큰 ✦ + 작은 ✦ 시차 펄스 */}
      <div className="relative text-orange-500">
        <Sparkle className="size-12 motion-safe:animate-pulse" />
        <Sparkle className="absolute -top-1.5 -right-4 size-5 text-orange-300 [animation-delay:600ms] motion-safe:animate-pulse" />
      </div>
      <h2 className="mt-6 text-title-s-semibold text-gray-900">이 지역 리포트를 생성하고 있어요</h2>
      {/* aria-live 노드는 유지하고 안쪽만 key 리마운트 — 문구 전환마다 페이드 */}
      <p aria-live="polite" className="mt-2 text-body-m-regular text-gray-500">
        <span key={caption} className="block animate-fade-up">
          {caption}
        </span>
      </p>
      {/* 유사 진행 바 — 90% 근처까지 차오르고 완료 시 화면째 전환 */}
      <div className="mt-9 h-1.5 w-full max-w-60 overflow-hidden rounded-full bg-gray-200/60">
        <div
          style={{ animationDelay: `-${initialElapsed}ms` }}
          className="h-full w-[90%] animate-generating-progress rounded-full bg-orange-500"
        />
      </div>
      {/* 안내한 시간을 넘기면 소요 시간 문구도 교체 — "10~15초"가 남아 있으면 모순으로 읽힌다 */}
      <p className="mt-3 text-caption-l-regular text-gray-400">{generatingHint(elapsed)}</p>
    </div>
  )
}
