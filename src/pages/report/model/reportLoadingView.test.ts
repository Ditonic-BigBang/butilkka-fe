import { describe, expect, it } from 'vitest'
import { resolveReportLoadingView, type ReportLoadingSignals } from './reportLoadingView'

const base: ReportLoadingSignals = {
  reportPending: false,
  reportError: false,
  historyEmpty: false,
  regionChanged: false,
  slowElapsed: false,
  generatingShown: false,
  minExposureDone: false,
}

describe('resolveReportLoadingView', () => {
  it('캐시 hit — pending 없이 시작하면 바로 본문', () => {
    expect(resolveReportLoadingView(base)).toBe('content')
  })

  it('pending + 판별 신호 없음 → 스켈레톤', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true })).toBe('skeleton')
  })

  it('pending + 히스토리 0개 → 생성 연출 (신규 가입 확정 생성)', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true, historyEmpty: true })).toBe(
      'generating',
    )
  })

  it('pending + 구 변경 플래그 → 생성 연출', () => {
    expect(resolveReportLoadingView({ ...base, reportPending: true, regionChanged: true })).toBe(
      'generating',
    )
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

  it('에러는 연출 중이어도 즉시 재시도 화면', () => {
    expect(resolveReportLoadingView({ ...base, reportError: true, generatingShown: true })).toBe(
      'error',
    )
  })
})
