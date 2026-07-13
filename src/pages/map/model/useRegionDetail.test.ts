import { describe, it, expect } from 'vitest'
import type { RegionDetailResponse } from '@/entities/region'
import { toGradeSheetView } from './useRegionDetail'

const metric = { value: 0, changeRate: 0, direction: 'FLAT' as const, trend: [] }

const detail: RegionDetailResponse = {
  regionCode: '3110002',
  district: '서대문구',
  regionName: '이대역',
  quarter: '2026Q1',
  declineGrade: {
    current: 'C',
    previous: 'B',
    trend: [
      { quarter: '2025Q3', grade: 'B' },
      { quarter: '2025Q4', grade: 'B' },
      { quarter: '2026Q1', grade: 'C' },
    ],
  },
  rentRatio: metric,
  footTraffic: metric,
  vacancyRate: metric,
  closureRate: { ...metric, avgOperatingYears: 3.2, seoulAvgOperatingYears: 4.1 },
  storeCount: { value: 0, changeCount: 0, direction: 'FLAT', trend: [], categoryDistribution: [] },
}

describe('toGradeSheetView', () => {
  it('DTO 를 등급 시트 뷰모델로 변환한다', () => {
    const view = toGradeSheetView(detail)

    expect(view.subtitle).toBe('서울 서대문구')
    expect(view.quarterLabel).toBe('26년 1분기')
    expect(view.grade).toBe('C')
    expect(view.status).toBe('주의')
    expect(view.lastGrade).toBe('B등급')
  })

  it('등급 추이는 A=5…E=1 값으로, 1분기 포인트만 연도 라벨·x축 tick 이 된다', () => {
    const view = toGradeSheetView(detail)

    expect(view.trend).toEqual([
      { label: '2025Q3', value: 4 },
      { label: '2025Q4', value: 4 },
      { label: '2026', value: 3 },
    ])
    expect(view.trendTicks).toEqual(['2026'])
  })
})
