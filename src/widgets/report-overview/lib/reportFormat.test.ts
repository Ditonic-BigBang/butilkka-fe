import { describe, expect, it } from 'vitest'
import { alternativesTitle, GRADE_STATUS, RECOMMENDATION_TITLES } from './reportFormat'

describe('GRADE_STATUS', () => {
  it('등급별 상태 라벨 (A 양호 ~ E 위험)', () => {
    expect(GRADE_STATUS.A).toBe('양호')
    expect(GRADE_STATUS.C).toBe('주의')
    expect(GRADE_STATUS.E).toBe('위험')
  })
})

describe('alternativesTitle', () => {
  it('버티기면 이번 분기 HOT상권 타이틀', () => {
    expect(alternativesTitle('버티기', '2026Q2')).toBe('2분기 HOT상권 🔥')
  })

  it('이동이면 추천 대체 상권', () => {
    expect(alternativesTitle('이동', '2026Q2')).toBe('추천 대체 상권')
  })
})

describe('RECOMMENDATION_TITLES', () => {
  it('AI 추천 상세가 없는 과거 리포트의 추천 유형별 폴백 문구를 제공한다', () => {
    expect(RECOMMENDATION_TITLES).toEqual({
      버티기: '현 위치 유지를 추천드려요',
      이동: '이동을 추천드려요',
    })
  })
})
