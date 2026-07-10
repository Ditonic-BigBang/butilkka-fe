/** "2026Q2" → "2026년 2분기" (형식이 아니면 원문 그대로) */
export function formatQuarter(quarter: string): string {
  const match = /^(\d{4})Q([1-4])$/.exec(quarter)
  if (!match) return quarter
  return `${match[1]}년 ${match[2]}분기`
}
