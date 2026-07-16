/**
 * 리포트 다운로드 — AI 리포트/상세보기 상단 다운로드 버튼의 공용 동작.
 * 임시로 브라우저 인쇄('PDF로 저장' 가능)를 띄운다.
 * TODO: 다운로드 방식(리포트 영역 PNG 캡처 / 서버 제공 파일 등) 확정 시 교체.
 */
export function downloadReport() {
  window.print()
}
