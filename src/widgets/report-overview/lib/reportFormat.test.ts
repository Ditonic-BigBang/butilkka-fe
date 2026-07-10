import { describe, expect, it } from 'vitest'
import { alternativesTitle, GRADE_STATUS, parseStat } from './reportFormat'

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

describe('parseStat', () => {
  it('"지표명 ±값" 을 스탯 타일로 파싱한다', () => {
    expect(parseStat('유동인구 +6.2%')).toEqual({
      label: '유동인구',
      value: '+6.2%',
      direction: 'up',
      change: '증가',
    })
    expect(parseStat('공실률 -1.4%p')).toEqual({
      label: '공실률',
      value: '-1.4%p',
      direction: 'down',
      change: '감소',
    })
  })

  it('부호 있는 값이 없으면 null (스탯 타일 생략)', () => {
    expect(parseStat('상위 10% 상권')).toBeNull()
    expect(parseStat('')).toBeNull()
  })
})
