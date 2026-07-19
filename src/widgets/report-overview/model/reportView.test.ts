import { describe, expect, it } from 'vitest'
import { makeReportMock } from '@/shared/api/mocks/fixtures'
import { GRADE_GAUGE_PROGRESS, toReportView } from './reportView'

describe('GRADE_GAUGE_PROGRESS', () => {
  it('A~E 등급마다 배포 score와 무관한 고정 게이지 위치를 사용한다', () => {
    expect(GRADE_GAUGE_PROGRESS).toEqual({
      A: 0.16,
      B: 0.38,
      C: 0.64,
      D: 0.91,
      E: 1,
    })
  })
})

describe('toReportView', () => {
  it('신규 AI 추천과 대안 상권 원시 지표를 화면 표시값으로 변환한다', () => {
    const view = toReportView(makeReportMock('이동'))

    expect(view.recommendationBadge).toBe('AI 추천')
    expect(view.recommendationTitle).toBe('이동을 추천드려요')
    expect(view.reason.title).toBe('장기적인 쇠퇴 예상')
    expect(view.alternatives[0]).toEqual({
      rank: 1,
      name: '마포구',
      description:
        '마포구는 현재보다 양호한 상권으로 유동인구가 꾸준히 증가하고 있어 안정적인 매출이 기대됩니다.',
      stats: [
        { label: '점포 수', value: '1,240개' },
        { label: '유동인구', value: '6,842만명' },
        { label: '공실률', value: '3.1%' },
      ],
      referenceDate: '2026년 2분기 기준',
    })
  })

  it('과거 리포트의 비어 있는 AI 추천 필드는 decision 문구로 대체한다', () => {
    const report = makeReportMock('버티기')
    report.aiRecommendation = {
      badgeType: 'AI 추천',
      title: null,
      reasonTitle: null,
      reasonDetail: null,
    }

    const view = toReportView(report)

    expect(view.recommendationTitle).toBe('현 위치 유지를 추천드려요')
    expect(view.reason).toEqual({
      title: report.decision.title,
      description: report.decision.description,
    })
  })

  it('대안 상권의 nullable 값은 각각 숨기고 빈 AI 문구는 만들지 않는다', () => {
    const report = makeReportMock()
    report.alternativeRegions = [
      {
        rank: 1,
        regionCode: '11440',
        regionName: '마포구',
        aiMessage: '',
        storeCount: null,
        floatingPopulation: 567_890,
        vacancy: null,
        baseDate: null,
      },
    ]

    expect(toReportView(report).alternatives).toEqual([
      {
        rank: 1,
        name: '마포구',
        description: undefined,
        stats: [{ label: '유동인구', value: '56.79만명' }],
        referenceDate: undefined,
      },
    ])
  })
})
