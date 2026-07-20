import { describe, expect, it } from 'vitest'
import { consumeReportGenerating, markReportGenerating } from './reportGeneratingFlag'

describe('reportGeneratingFlag', () => {
  it('mark 없이 consume 하면 false', () => {
    expect(consumeReportGenerating()).toBe(false)
  })

  it('mark 후 첫 consume 은 true, 재 consume 은 false (1회 소비)', () => {
    markReportGenerating()
    expect(consumeReportGenerating()).toBe(true)
    expect(consumeReportGenerating()).toBe(false)
  })
})
