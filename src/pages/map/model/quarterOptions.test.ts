import { describe, it, expect } from 'vitest'
import { buildQuarterOptions } from './quarterOptions'

describe('buildQuarterOptions', () => {
  it('최신 분기부터 12개 분기를 연도 내림차순·분기 오름차순으로 묶는다', () => {
    const options = buildQuarterOptions('2026Q1')

    expect(options.map((o) => o.year)).toEqual([2026, 2025, 2024, 2023])
    expect(options[0].quarters).toEqual(['2026Q1'])
    expect(options[1].quarters).toEqual(['2025Q1', '2025Q2', '2025Q3', '2025Q4'])
    expect(options[3].quarters).toEqual(['2023Q2', '2023Q3', '2023Q4'])
    expect(options.flatMap((o) => o.quarters)).toHaveLength(12)
  })

  it('연도 경계(4분기)에서 올바르게 넘어간다', () => {
    const options = buildQuarterOptions('2025Q4', 5)
    expect(options[0]).toEqual({ year: 2025, quarters: ['2025Q1', '2025Q2', '2025Q3', '2025Q4'] })
    expect(options[1]).toEqual({ year: 2024, quarters: ['2024Q4'] })
  })

  it('형식이 아니면 빈 배열', () => {
    expect(buildQuarterOptions('latest')).toEqual([])
  })
})
