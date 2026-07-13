import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RankingSheet } from './RankingSheet'
import type { RankingRow } from '../model/useDeclineRanking'

const ROWS: RankingRow[] = [
  { rank: 1, regionCode: '3110002', name: '서울 서대문구', grade: 'E', direction: 'up' },
  { rank: 2, regionCode: '3110003', name: '서울 광진구', grade: 'E', direction: 'down' },
]

describe('RankingSheet', () => {
  it('헤더와 순위 목록을 렌더링한다', () => {
    render(<RankingSheet order="top" onOrderChange={() => {}} rows={ROWS} />)

    expect(screen.getByText('쇠퇴 등급')).toBeInTheDocument()
    expect(screen.getByText('서울 전체')).toBeInTheDocument()
    expect(screen.getByText('서울 서대문구')).toBeInTheDocument()
    expect(screen.getByText('서울 광진구')).toBeInTheDocument()
  })

  it('정렬 탭 클릭 시 onOrderChange 를 호출한다', async () => {
    const user = userEvent.setup()
    const onOrderChange = vi.fn()
    render(<RankingSheet order="top" onOrderChange={onOrderChange} rows={ROWS} />)

    await user.click(screen.getByRole('tab', { name: '안전한 순' }))
    expect(onOrderChange).toHaveBeenCalledWith('bottom')
  })

  it('핸들을 탭하면 펼침/접힘이 전환된다', async () => {
    const user = userEvent.setup()
    render(<RankingSheet order="top" onOrderChange={() => {}} rows={ROWS} />)

    const toggle = screen.getByRole('button', { expanded: false })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
