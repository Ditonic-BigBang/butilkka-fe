export type YearQuarters = { year: number; quarters: string[] }

/**
 * 최신 분기부터 거슬러 최근 3년(12개 분기)을 연도별로 묶는다.
 * 연도는 내림차순(최신 먼저), 연도 안 분기는 오름차순(1분기→4분기) — 기간 선택 시트 표기 순서.
 */
export function buildQuarterOptions(latestQuarter: string, count = 12): YearQuarters[] {
  const match = /^(\d{4})Q([1-4])$/.exec(latestQuarter)
  if (!match) return []

  let year = Number(match[1])
  let q = Number(match[2])
  const byYear = new Map<number, string[]>()

  for (let i = 0; i < count; i++) {
    const list = byYear.get(year) ?? []
    list.unshift(`${year}Q${q}`)
    byYear.set(year, list)
    q -= 1
    if (q === 0) {
      q = 4
      year -= 1
    }
  }

  return [...byYear.entries()]
    .toSorted(([a], [b]) => b - a)
    .map(([y, quarters]) => ({ year: y, quarters }))
}
