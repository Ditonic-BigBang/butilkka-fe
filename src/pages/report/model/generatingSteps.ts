/** 생성 단계 문구 — 순차 전환, 마지막 문구는 유지 */
export const GENERATING_STEPS = [
  '상권 데이터를 수집하고 있어요',
  '유동인구·공실률을 분석하고 있어요',
  '유사 사례와 대조하고 있어요',
  'AI가 리포트를 작성하고 있어요',
]
export const STEP_INTERVAL_MS = 3000
/** 안내한 소요 시간(10~15초)을 넘기는 시점 — 문구를 안심 문구로 교체 */
export const LONG_WAIT_MS = 15000

export const LONG_WAIT_CAPTION = '거의 다 됐어요. 조금만 더 기다려주세요'
export const DURATION_HINT = '보통 10~15초 정도 걸려요'
export const LONG_WAIT_HINT = '데이터가 많은 지역은 조금 더 걸릴 수 있어요'

/** 생성 시작 후 경과 시간에 해당하는 문구 (단계 문구 → 장기화 문구) */
export function generatingCaption(elapsedMs: number): string {
  if (elapsedMs >= LONG_WAIT_MS) return LONG_WAIT_CAPTION
  const step = Math.min(
    Math.max(Math.floor(elapsedMs / STEP_INTERVAL_MS), 0),
    GENERATING_STEPS.length - 1,
  )
  return GENERATING_STEPS[step]
}

/** 하단 소요 시간 안내 — 안내한 시간을 넘기면 모순되지 않게 교체 */
export function generatingHint(elapsedMs: number): string {
  return elapsedMs >= LONG_WAIT_MS ? LONG_WAIT_HINT : DURATION_HINT
}
