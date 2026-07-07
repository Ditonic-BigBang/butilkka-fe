import { describe, expect, it } from 'vitest'
import { highlight } from './highlight'

describe('highlight', () => {
  it('검색어 없으면 전체를 비매칭 한 조각으로', () => {
    expect(highlight('서울 서대문구')).toEqual([
      { text: '서울 서대문구', match: false, key: 'all' },
    ])
    expect(highlight('서울 서대문구', '  ')).toEqual([
      { text: '서울 서대문구', match: false, key: 'all' },
    ])
  })

  it('중간 매칭: pre / hit / post 로 분리', () => {
    expect(highlight('서울 서대문구', '서대')).toEqual([
      { text: '서울 ', match: false, key: 'pre' },
      { text: '서대', match: true, key: 'hit' },
      { text: '문구', match: false, key: 'post' },
    ])
  })

  it('앞부분 매칭: 빈 pre 는 제거', () => {
    expect(highlight('서대문구', '서대')).toEqual([
      { text: '서대', match: true, key: 'hit' },
      { text: '문구', match: false, key: 'post' },
    ])
  })

  it('대소문자 무시하되 원문 표기는 보존', () => {
    const parts = highlight('Seoul Mapo', 'mapo')
    expect(parts.find((p) => p.match)?.text).toBe('Mapo')
  })

  it('매칭 없으면 전체 비매칭', () => {
    expect(highlight('서울', '부산')).toEqual([{ text: '서울', match: false, key: 'all' }])
  })
})
