import { describe, expect, it } from 'vitest'
import { resolveReportLoadingView, type ReportLoadingSignals } from './reportLoadingView'

const base: ReportLoadingSignals = {
  reportPending: false,
  reportError: false,
  historyEmpty: false,
  historySettled: true,
  generationResumed: false,
  graceElapsed: false,
  slowElapsed: false,
  generatingShown: false,
  minExposureDone: false,
  generationDisproved: false,
}

describe('resolveReportLoadingView', () => {
  it('캐시 hit — pending 없이 시작하면 바로 본문', () => {
    expect(resolveReportLoadingView(base)).toBe('content')
  })

  it('pending + 히스토리 도착 전(유예 중) → 판별 유예 (스켈레톤 번쩍임 방지)', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true, historySettled: false })).toBe(
      'deciding',
    )
  })

  it('pending + 유예 시간 경과 → 히스토리가 늦어도 스켈레톤', () => {
    expect(
      resolveReportLoadingView({
        ...base,
        reportPending: true,
        historySettled: false,
        graceElapsed: true,
      }),
    ).toBe('skeleton')
  })

  it('pending + 히스토리 있음(판별 끝) → 스켈레톤', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true })).toBe('skeleton')
  })

  it('pending + 히스토리 0건 → 생성 연출 (그 구에 리포트가 없다 = 확정 생성)', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true, historyEmpty: true })).toBe(
      'generating',
    )
  })

  it('생성 중 다른 화면에 다녀와도 유예 없이 바로 연출로 복귀', () => {
    expect(
      resolveReportLoadingView({
        ...base,
        reportPending: true,
        historySettled: false,
        generationResumed: true,
      }),
    ).toBe('generating')
  })

  it('pending + 시간 경과 폴백 → 생성 연출', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true, slowElapsed: true })).toBe(
      'generating',
    )
  })

  it('연출이 한 번 켜지면 신호가 사라져도 유지 (스켈레톤 역전환 금지)', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true, generatingShown: true })).toBe(
      'generating',
    )
  })

  it('응답이 와도 최소 노출을 채울 때까지 연출 유지', () => {
    expect(resolveReportLoadingView({ ...base, generatingShown: true })).toBe('generating')
  })

  it('최소 노출을 채우면 본문 전환', () => {
    expect(
      resolveReportLoadingView({ ...base, generatingShown: true, minExposureDone: true }),
    ).toBe('content')
  })

  it('생성이 아니었다고 응답이 알려주면(generated=false) 최소 노출을 건너뛰고 본문', () => {
    expect(
      resolveReportLoadingView({ ...base, generatingShown: true, generationDisproved: true }),
    ).toBe('content')
  })

  it('에러는 연출 중이어도 즉시 재시도 화면', () => {
    expect(resolveReportLoadingView({ ...base, reportError: true, generatingShown: true })).toBe(
      'error',
    )
  })
})
