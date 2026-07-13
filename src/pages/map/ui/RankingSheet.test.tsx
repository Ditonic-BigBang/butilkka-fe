import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RankingSheet } from './RankingSheet'
import type { RankingRow } from '../model/useRanking'
import type { MetricSheetView } from '../model/useRegionDetail'

const GRADE_PROPS = { title: '쇠퇴 등급', tabs: ['위험 높은 순', '안전한 순'] as [string, string] }

const ROWS: RankingRow[] = [
  {
    rank: 1,
    regionCode: '3110002',
    name: '서울 서대문구',
    value: 'E',
    unit: '등급',
    direction: 'up',
  },
  {
    rank: 2,
    regionCode: '3110003',
    name: '서울 광진구',
    value: 'E',
    unit: '등급',
    direction: 'down',
  },
]

const METRIC_ROWS: RankingRow[] = [
  {
    rank: 1,
    regionCode: '3110002',
    name: '서울 서대문구',
    value: '789',
    unit: '만원',
    direction: 'up',
  },
]

describe('RankingSheet', () => {
  it('헤더와 순위 목록을 렌더링한다', () => {
    render(<RankingSheet {...GRADE_PROPS} order="top" onOrderChange={() => {}} rows={ROWS} />)

    expect(screen.getByText('쇠퇴 등급')).toBeInTheDocument()
    expect(screen.getByText('서울 전체')).toBeInTheDocument()
    expect(screen.getByText('서울 서대문구')).toBeInTheDocument()
    expect(screen.getByText('서울 광진구')).toBeInTheDocument()
  })

  it('지표 카테고리는 제목·탭·값 단위가 바뀐다', () => {
    render(
      <RankingSheet
        title="매출 대비 임대료"
        tabs={['상위 5위', '하위 5위']}
        order="top"
        onOrderChange={() => {}}
        rows={METRIC_ROWS}
      />,
    )

    expect(screen.getByText('매출 대비 임대료')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '상위 5위' })).toBeInTheDocument()
    expect(screen.getByText('789')).toBeInTheDocument()
    expect(screen.getByText('만원')).toBeInTheDocument()
  })

  it('지표 상세(detail)는 값과 증감칩을 그 자리에서 보여준다', () => {
    const detail: MetricSheetView = {
      kind: 'metric',
      subtitle: '서울 서대문구',
      district: '서대문구',
      quarterLabel: '26년 1분기',
      value: '789',
      unit: '만원',
      comparison: { label: '이전 분기 대비', percent: '5%', direction: 'down' },
      trend: [
        { label: '2025Q4', value: 780 },
        { label: '2026', value: 789 },
      ],
      trendTicks: ['2026'],
      trendUnit: '(만원)',
    }
    render(
      <RankingSheet
        title="매출 대비 임대료"
        tabs={['상위 5위', '하위 5위']}
        order="top"
        onOrderChange={() => {}}
        rows={[]}
        detail={detail}
        onClearDetail={() => {}}
      />,
    )

    expect(screen.getByText('서울 서대문구')).toBeInTheDocument()
    expect(screen.getByText('789')).toBeInTheDocument()
    expect(screen.getByText('이전 분기 대비')).toBeInTheDocument()
    expect(screen.getByText('전체 보기')).toBeInTheDocument()
    // 상세 모드에선 정렬 탭이 없다
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('averagePeriod 가 있으면 랭킹 아래 평균 영업 기간 섹션을 보여준다', () => {
    render(
      <RankingSheet
        title="폐업률"
        tabs={['상위 5위', '하위 5위']}
        order="top"
        onOrderChange={() => {}}
        rows={METRIC_ROWS}
        averagePeriod={{ label: '서울 전체', years: '5.9' }}
      />,
    )

    expect(screen.getByText('평균 영업 기간')).toBeInTheDocument()
    expect(screen.getByText('5.9')).toBeInTheDocument()
  })

  it('정렬 탭 클릭 시 onOrderChange 를 호출한다', async () => {
    const user = userEvent.setup()
    const onOrderChange = vi.fn()
    render(<RankingSheet {...GRADE_PROPS} order="top" onOrderChange={onOrderChange} rows={ROWS} />)

    await user.click(screen.getByRole('tab', { name: '안전한 순' }))
    expect(onOrderChange).toHaveBeenCalledWith('bottom')
  })

  it('핸들을 탭하면 펼침/접힘이 전환된다', async () => {
    const user = userEvent.setup()
    render(<RankingSheet {...GRADE_PROPS} order="top" onOrderChange={() => {}} rows={ROWS} />)

    const toggle = screen.getByRole('button', { expanded: false })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('expanded 를 지정하면 controlled — 핸들 탭은 onExpandedChange 만 호출한다', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(
      <RankingSheet
        {...GRADE_PROPS}
        order="top"
        onOrderChange={() => {}}
        rows={ROWS}
        expanded
        onExpandedChange={onExpandedChange}
      />,
    )

    const toggle = screen.getByRole('button', { expanded: true })
    await user.click(toggle)
    expect(onExpandedChange).toHaveBeenCalledWith(false)
    // 부모가 반영하기 전까진 그대로 펼침 (controlled)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
