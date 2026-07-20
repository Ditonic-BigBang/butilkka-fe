import { useEffect, useRef, useState } from 'react'
import { consumeReportGenerating } from '@/entities/report'
import {
  clearGenerationStarted,
  getGenerationStartedAt,
  markGenerationStarted,
} from './generationClock'
import {
  DECISION_GRACE_MS,
  MIN_EXPOSURE_MS,
  SLOW_FALLBACK_MS,
  resolveReportLoadingView,
  type ReportLoadingView,
} from './reportLoadingView'

/**
 * 생성 판별 신호를 모아 리포트 본문 화면(본문/스켈레톤/생성 연출/에러)을 결정한다.
 * 구 변경 플래그는 마운트 시 1회 소비, 시간 폴백·최소 노출 타이머를 관리한다.
 * 진행 중이던 생성은 시작 시각(generationClock)으로 이어받아 연출이 되감기지 않게 한다.
 */
export function useReportLoadingView(input: {
  reportPending: boolean
  reportError: boolean
  historyEmpty: boolean
  historySettled: boolean
}): { view: ReportLoadingView; generatingSince: number | null } {
  // lazy initializer 로 마운트 시 1회 소비 — 리렌더에 안정적.
  // StrictMode 이중 실행에선 두 번째가 false 일 수 있으나 dev 한정, 래치·시간 폴백이 커버.
  const [regionChanged] = useState(consumeReportGenerating)
  // 다른 화면에 다녀오는 사이에도 생성은 계속된다 — 진행 중이었으면 유예 없이 바로 연출로 복귀
  const [generationResumed] = useState(() => getGenerationStartedAt() != null)
  const [generatingSince, setGeneratingSince] = useState(getGenerationStartedAt)
  const [graceElapsed, setGraceElapsed] = useState(false)
  const [slowElapsed, setSlowElapsed] = useState(false)
  // 래치는 generationResumed 가 이미 유지하므로 false 로 시작한다 —
  // true 로 두면 아래 최소 노출 타이머가 안 돌아 minExposureDone 이 영영 false 로 남는다
  const [generatingShown, setGeneratingShown] = useState(false)
  const [minExposureDone, setMinExposureDone] = useState(false)

  // 판별 유예·시간 폴백 타이머 — pending 인 동안만 (종료 시 cleanup 으로 해제)
  useEffect(() => {
    if (!input.reportPending) return
    const grace = setTimeout(() => setGraceElapsed(true), DECISION_GRACE_MS)
    const slow = setTimeout(() => setSlowElapsed(true), SLOW_FALLBACK_MS)
    return () => {
      clearTimeout(grace)
      clearTimeout(slow)
    }
  }, [input.reportPending])

  const view = resolveReportLoadingView({
    ...input,
    regionChanged: regionChanged || generationResumed,
    graceElapsed,
    slowElapsed,
    generatingShown,
    minExposureDone,
  })

  // 연출 최초 진입 시 래치 + 최소 노출 타이머 시작.
  // 이 타이머는 effect cleanup 으로 지우면 안 된다 — pending 종료 리렌더에 죽어
  // minExposureDone 이 영원히 false 로 남는다. ref 에 들고 unmount 에서만 정리.
  const minTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (view !== 'generating') return
    setGeneratingSince(markGenerationStarted())
    if (generatingShown) return
    setGeneratingShown(true)
    minTimerRef.current = setTimeout(() => setMinExposureDone(true), MIN_EXPOSURE_MS)
  }, [view, generatingShown])
  useEffect(() => () => clearTimeout(minTimerRef.current), [])

  // 생성 종료 — 다음 진입이 지난 진행을 이어받지 않도록 시계를 끈다
  useEffect(() => {
    if (view === 'content' || view === 'error') clearGenerationStarted()
  }, [view])

  return { view, generatingSince }
}
