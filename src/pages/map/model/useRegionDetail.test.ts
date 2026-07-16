import { describe, it, expect } from 'vitest'
import type { RegionDetailResponse } from '@/entities/region'
import { toGradeSheetView, toMetricSheetView } from './useRegionDetail'

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
  rentRatio: {
    value: 7_890_000,
    changeRate: 5,
    direction: 'DOWN',
    trend: [
      { quarter: '2025Q3', value: 7_600_000 },
      { quarter: '2025Q4', value: 7_500_000 },
      { quarter: '2026Q1', value: 7_890_000 },
    ],
  },
  footTraffic: metric,
  vacancyRate: metric,
  closureRate: { ...metric, avgOperatingYears: 3.2, seoulAvgOperatingYears: 4.1 },
  storeCount: { value: 0, changeCount: 0, direction: 'FLAT', trend: [], categoryDistribution: [] },
}

describe('toGradeSheetView', () => {
  it('DTO 를 등급 시트 뷰모델로 변환한다', () => {
    const view = toGradeSheetView(detail)

    expect(view.kind).toBe('grade')
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

describe('toMetricSheetView', () => {
  it('상단 임대료는 원 단위, 추이 그래프는 천만원 단위로 변환한다', () => {
    const view = toMetricSheetView(detail, 'rentRatio')

    expect(view.kind).toBe('metric')
    expect(view.subtitle).toBe('서울 서대문구')
    expect(view.quarterLabel).toBe('26년 1분기')
    expect(view.value).toBe('7,890,000')
    expect(view.unit).toBe('원')
    expect(view.comparison).toEqual({
      label: '이전 분기 대비',
      percent: '5%',
      direction: 'down',
    })
    expect(view.trend).toEqual([
      { label: '2025Q3', value: 0.76 },
      { label: '2025Q4', value: 0.75 },
      { label: '2026', value: 0.789 },
    ])
    expect(view.trendTicks).toEqual(['2026'])
    expect(view.trendUnit).toBe('(천만원)')
  })

  it('유동인구 추이 그래프는 만명 단위로 변환한다', () => {
    const view = toMetricSheetView(
      {
        ...detail,
        footTraffic: {
          value: 125_000,
          changeRate: 3.4567,
          direction: 'UP',
          trend: [
            { quarter: '2025Q4', value: 120_000 },
            { quarter: '2026Q1', value: 125_000 },
          ],
        },
      },
      'footTraffic',
    )

    expect(view.value).toBe('125,000')
    expect(view.unit).toBe('명')
    expect(view.trend).toEqual([
      { label: '2025Q4', value: 12 },
      { label: '2026', value: 12.5 },
    ])
    expect(view.trendUnit).toBe('(만명)')
    expect(view.comparison.percent).toBe('3.45%')
  })

  it('이전 분기 대비 값은 반올림하지 않고 소수점 둘째 자리까지만 표시한다', () => {
    const view = toMetricSheetView(
      {
        ...detail,
        rentRatio: { ...detail.rentRatio, changeRate: -5.6789 },
      },
      'rentRatio',
    )

    expect(view.comparison.percent).toBe('5.67%')
  })

  it('점포수는 changeRate 가 없어 추이 마지막 두 분기로 증감률(%)을 계산한다', () => {
    const view = toMetricSheetView(
      {
        ...detail,
        storeCount: {
          value: 380,
          changeCount: -20,
          direction: 'DOWN',
          trend: [
            { quarter: '2025Q4', value: 400 },
            { quarter: '2026Q1', value: 380 },
          ],
          categoryDistribution: [],
        },
      },
      'storeCount',
    )

    expect(view.value).toBe('380')
    expect(view.unit).toBe('개')
    expect(view.comparison).toEqual({ label: '이전 분기 대비', percent: '5%', direction: 'down' })
  })

  it('점포수 추이가 없으면 증감 개수로 폴백한다', () => {
    const view = toMetricSheetView(
      { ...detail, storeCount: { ...detail.storeCount, changeCount: -7, direction: 'DOWN' } },
      'storeCount',
    )

    expect(view.comparison.percent).toBe('7개')
  })

  it('폐업률은 평균 영업 기간 섹션 데이터를 포함한다', () => {
    const view = toMetricSheetView(detail, 'closureRate')

    expect(view.averagePeriod).toEqual({ label: '서울 서대문구', years: '3.2' })
  })

  it('평균 영업 기간이 없는 지표는 averagePeriod 를 만들지 않는다', () => {
    const view = toMetricSheetView(detail, 'rentRatio')

    expect(view.averagePeriod).toBeUndefined()
  })
})
