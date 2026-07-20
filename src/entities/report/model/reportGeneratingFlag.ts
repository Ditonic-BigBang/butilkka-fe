const KEY = 'butilkka.report-generating'

/** 가게를 다른 구로 저장한 직후 심는다 — 다음 리포트 조회는 생성(10~15초)임을 예고 */
export function markReportGenerating() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // 시크릿 모드 등 저장 불가 — 리포트 페이지의 시간 경과 폴백이 커버
  }
}

/** 1회 소비(consume & clear) — 리포트 페이지 마운트 시 읽고 지운다 */
export function consumeReportGenerating(): boolean {
  try {
    const marked = sessionStorage.getItem(KEY) === '1'
    sessionStorage.removeItem(KEY)
    return marked
  } catch {
    return false
  }
}
