/**
 * 리포트 생성 시작 시각.
 *
 * 연출의 진행 바·단계 문구는 "화면을 띄운 뒤 경과"가 아니라 "생성이 시작된 뒤 경과" 기준이어야 한다
 * — 다른 탭에 갔다 돌아오면 컴포넌트는 새로 마운트되지만 서버의 생성은 계속 진행 중이므로,
 * 처음부터 다시 차오르면 진행이 되돌아간 것처럼 보인다.
 * 라우트 이동에도 살아남도록 모듈 상태로 둔다(새로고침하면 요청도 다시 시작하므로 함께 초기화).
 */
let startedAt: number | null = null

/** 생성 시작을 기록하고 시작 시각을 돌려준다 (이미 진행 중이면 최초 시각 유지) */
export function markGenerationStarted(): number {
  startedAt ??= Date.now()
  return startedAt
}

/** 진행 중인 생성의 시작 시각 — 없으면 null */
export function getGenerationStartedAt(): number | null {
  return startedAt
}

/** 생성 종료(본문 도착·에러) */
export function clearGenerationStarted() {
  startedAt = null
}
