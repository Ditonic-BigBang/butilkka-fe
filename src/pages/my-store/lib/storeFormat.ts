/** 창업일 "YYYY-MM-DD" → "YYYY년 M월 D일 창업" (값 없음·형식 오류면 빈 문자열) */
export function formatFounded(storeOpenDate?: string): string {
  if (!storeOpenDate) return ''
  const [year, month, day] = storeOpenDate.split('-').map(Number)
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) return ''
  return `${year}년 ${month}월 ${day}일 창업`
}
