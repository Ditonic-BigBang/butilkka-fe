/** 리포트 본문 자리에 보여줄 화면 — deciding 은 판별 유예(빈 배경) */
export type ReportLoadingView = 'content' | 'deciding' | 'skeleton' | 'generating' | 'error'

/** 판별 신호 없이 pending 이 이 시간을 넘기면 생성으로 간주하는 폴백 */
export const SLOW_FALLBACK_MS = 2000
/** 생성 연출 최소 노출 — 빠른 응답 시 연출이 번쩍 떴다 사라지는 것 방지 */
export const MIN_EXPOSURE_MS = 1200
/** 판별 유예 — 히스토리 응답 전까지 스켈레톤을 미뤄 스켈레톤→연출 번쩍임 방지 (delayed spinner) */
export const DECISION_GRACE_MS = 600

export interface ReportLoadingSignals {
  reportPending: boolean
  reportError: boolean
  /** 히스토리 resolve 완료 && 리포트 0개 — 확정 생성 (신규 가입 첫 리포트) */
  historyEmpty: boolean
  /** 히스토리 요청이 끝났는가(성공·실패 무관) — 끝나기 전엔 판별 유예 */
  historySettled: boolean
  /** pending 시작 후 DECISION_GRACE_MS 경과 — 히스토리가 늦어도 유예를 끝낸다 */
  graceElapsed: boolean
  /** 가게를 다른 구로 저장한 직후 심긴 플래그 — 마운트 시 1회 소비된 값 */
  regionChanged: boolean
  /** pending 시작 후 SLOW_FALLBACK_MS 경과 */
  slowElapsed: boolean
  /** 연출이 한 번이라도 켜졌는가 — 스켈레톤 역전환 금지 래치 */
  generatingShown: boolean
  /** 연출 최소 노출 시간 경과 */
  minExposureDone: boolean
}

/**
 * 리포트 로딩 화면 판별.
 * `GET /reports/latest` 는 리포트가 없으면 같은 엔드포인트에서 10~15초 동기 생성하는데
 * 생성/조회 구분 신호가 없어 FE 신호로 추정한다: 히스토리 0개(확정) > 구 변경 플래그 > 시간 폴백.
 */
export function resolveReportLoadingView(s: ReportLoadingSignals): ReportLoadingView {
  if (s.reportError) return 'error' // 에러는 최소 노출보다 우선 — 즉시 재시도 화면
  if (s.reportPending) {
    if (s.historyEmpty || s.regionChanged || s.slowElapsed || s.generatingShown) return 'generating'
    // 히스토리 응답 전엔 스켈레톤을 미룬다 — 곧 연출로 판별될 수 있는데 스켈레톤이
    // 번쩍 떴다 바뀌는 것보다 짧은 빈 배경이 덜 어색하다
    if (!s.historySettled && !s.graceElapsed) return 'deciding'
    return 'skeleton'
  }
  // pending 종료 — 연출이 떠 있었으면 최소 노출을 채우고 본문으로 (번쩍임 방지)
  if (s.generatingShown && !s.minExposureDone) return 'generating'
  return 'content'
}
