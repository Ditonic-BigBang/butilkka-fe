import { describe, expect, it } from 'vitest'
import type { ReportHistoryItem } from '@/entities/report'
import { pickPreviousReport } from './pickPreviousReport'

const item = (
  reportId: number,
  quarter: string,
  regionCode?: string,
  regionName?: string,
): ReportHistoryItem => ({
  reportId,
  quarter,
  grade: 'B',
  briefing: '',
  regionCode,
  regionName,
})

describe('pickPreviousReport', () => {
  it('같은 상권의 이전 분기를 고른다', () => {
    const history = [item(3, '2026Q3', '11440'), item(2, '2026Q2', '11440')]
    expect(pickPreviousReport(history, { quarter: '2026Q3', regionCode: '11440' })?.reportId).toBe(
      2,
    )
  })

  it('다른 가게(상권)의 이전 분기는 고르지 않는다', () => {
    const history = [item(9, '2026Q2', '11170')] // 용산구 — 현재 가게는 마포구
    expect(pickPreviousReport(history, { quarter: '2026Q3', regionCode: '11440' })).toBeUndefined()
  })

  it('같은 분기 다른 상권 리포트가 섞여 있어도 이전 분기만 고른다', () => {
    const history = [
      item(5, '2026Q3', '11170'),
      item(4, '2026Q3', '11440'),
      item(1, '2026Q1', '11440'),
    ]
    expect(pickPreviousReport(history, { quarter: '2026Q3', regionCode: '11440' })?.reportId).toBe(
      1,
    )
  })

  it('상권 코드가 없는 구버전 응답은 분기만으로 비교', () => {
    const history = [item(2, '2026Q2')]
    expect(pickPreviousReport(history, { quarter: '2026Q3', regionCode: '11440' })?.reportId).toBe(
      2,
    )
  })

  it('코드 체계가 달라 코드가 안 맞아도 자치구명이 같으면 같은 구로 본다', () => {
    // 히스토리는 자치구 코드(11440), 리포트 상세는 상권 코드(3110001)일 수 있다
    const history = [item(2, '2026Q2', '11440', '마포구')]
    expect(
      pickPreviousReport(history, {
        quarter: '2026Q3',
        regionCode: '3110001',
        districtName: '마포구',
      })?.reportId,
    ).toBe(2)
  })

  it('자치구명이 다르면 코드가 안 맞을 때 고르지 않는다', () => {
    const history = [item(9, '2026Q2', '11170', '용산구')]
    expect(
      pickPreviousReport(history, {
        quarter: '2026Q3',
        regionCode: '3110001',
        districtName: '마포구',
      }),
    ).toBeUndefined()
  })

  it('이전 분기가 없으면 undefined', () => {
    expect(pickPreviousReport([], { quarter: '2026Q3', regionCode: '11440' })).toBeUndefined()
    expect(pickPreviousReport(undefined, { quarter: '2026Q3' })).toBeUndefined()
  })
})
