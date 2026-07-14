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

  // 가장 이른 연도는 1분기부터 채운다 — 연도 단위 UI 에서 중간 분기부터 시작하면 어색
  const earliestYear = Math.min(...byYear.keys())
  const earliestList = byYear.get(earliestYear) as string[]
  const firstQuarter = Number(earliestList[0].slice(-1))
  for (let missing = firstQuarter - 1; missing >= 1; missing--) {
    earliestList.unshift(`${earliestYear}Q${missing}`)
  }

  return [...byYear.entries()]
    .toSorted(([a], [b]) => b - a)
    .map(([y, quarters]) => ({ year: y, quarters }))
}
