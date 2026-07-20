import { useEffect, useRef, useState } from 'react'
import { consumeReportGenerating } from '@/entities/report'
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
 */
export function useReportLoadingView(input: {
  reportPending: boolean
  reportError: boolean
  historyEmpty: boolean
  historySettled: boolean
}): ReportLoadingView {
  // lazy initializer 로 마운트 시 1회 소비 — 리렌더에 안정적.
  // StrictMode 이중 실행에선 두 번째가 false 일 수 있으나 dev 한정, 래치·시간 폴백이 커버.
  const [regionChanged] = useState(consumeReportGenerating)
  const [graceElapsed, setGraceElapsed] = useState(false)
  const [slowElapsed, setSlowElapsed] = useState(false)
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
    regionChanged,
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
    if (view !== 'generating' || generatingShown) return
    setGeneratingShown(true)
    minTimerRef.current = setTimeout(() => setMinExposureDone(true), MIN_EXPOSURE_MS)
  }, [view, generatingShown])
  useEffect(() => () => clearTimeout(minTimerRef.current), [])

  return view
}
