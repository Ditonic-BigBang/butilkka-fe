import { describe, expect, it } from 'vitest'
import {
  DURATION_HINT,
  GENERATING_STEPS,
  LONG_WAIT_CAPTION,
  LONG_WAIT_HINT,
  generatingCaption,
  generatingHint,
} from './generatingSteps'

describe('generatingCaption', () => {
  it('경과 시간에 따라 단계 문구가 순서대로 바뀐다', () => {
    expect(generatingCaption(0)).toBe(GENERATING_STEPS[0])
    expect(generatingCaption(3000)).toBe(GENERATING_STEPS[1])
    expect(generatingCaption(6000)).toBe(GENERATING_STEPS[2])
    expect(generatingCaption(9000)).toBe(GENERATING_STEPS[3])
  })

  it('마지막 단계 문구는 장기화 전까지 유지된다', () => {
    expect(generatingCaption(12000)).toBe(GENERATING_STEPS[3])
    expect(generatingCaption(14999)).toBe(GENERATING_STEPS[3])
  })

  it('15초를 넘기면 장기화 문구로 교체된다', () => {
    expect(generatingCaption(15000)).toBe(LONG_WAIT_CAPTION)
    expect(generatingCaption(60000)).toBe(LONG_WAIT_CAPTION)
  })

  it('재진입으로 경과가 이미 쌓여 있으면 그 시점 문구부터 보여준다', () => {
    expect(generatingCaption(7000)).toBe(GENERATING_STEPS[2])
  })
})

describe('generatingHint', () => {
  it('안내한 시간 안에서는 소요 시간 안내', () => {
    expect(generatingHint(0)).toBe(DURATION_HINT)
    expect(generatingHint(14999)).toBe(DURATION_HINT)
  })

  it('안내한 시간을 넘기면 모순되지 않는 문구로 교체', () => {
    expect(generatingHint(15000)).toBe(LONG_WAIT_HINT)
  })
})
