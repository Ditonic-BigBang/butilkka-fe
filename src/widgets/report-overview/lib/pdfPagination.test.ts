import { describe, expect, it } from 'vitest'
import { computePageSlices } from './pdfPagination'

describe('computePageSlices', () => {
  it('전체가 한 페이지에 들어가면 슬라이스 1개', () => {
    const slices = computePageSlices([{ top: 0, bottom: 300 }], 600, 400)
    expect(slices).toEqual([{ start: 0, end: 400 }])
  })

  it('페이지를 넘는 블록 앞에서 끊는다 (카드 중간 잘림 방지)', () => {
    const blocks = [
      { top: 0, bottom: 250 },
      { top: 262, bottom: 500 },
      { top: 512, bottom: 700 }, // 600 페이지에 안 들어감 → 512 에서 컷
    ]
    const slices = computePageSlices(blocks, 600, 720)
    expect(slices).toEqual([
      { start: 0, end: 512 },
      { start: 512, end: 720 },
    ])
  })

  it('여러 페이지에 걸쳐 연속으로 끊는다', () => {
    const blocks = [
      { top: 0, bottom: 400 },
      { top: 410, bottom: 800 }, // 1페이지 초과 → 410 컷
      { top: 810, bottom: 1200 }, // 2페이지(410~1010) 초과 → 810 컷
    ]
    const slices = computePageSlices(blocks, 600, 1220)
    expect(slices).toEqual([
      { start: 0, end: 410 },
      { start: 410, end: 810 },
      { start: 810, end: 1220 },
    ])
  })

  it('페이지보다 큰 블록은 페이지 높이로 하드 컷', () => {
    const blocks = [
      { top: 0, bottom: 100 },
      { top: 110, bottom: 1500 }, // 600 짜리 페이지 둘을 넘는 거대 블록
    ]
    const slices = computePageSlices(blocks, 600, 1500)
    expect(slices).toEqual([
      { start: 0, end: 110 },
      { start: 110, end: 710 },
      { start: 710, end: 1310 },
      { start: 1310, end: 1500 },
    ])
  })

  it('블록이 없으면 페이지 높이 단위로만 자른다', () => {
    const slices = computePageSlices([], 600, 1300)
    expect(slices).toEqual([
      { start: 0, end: 600 },
      { start: 600, end: 1200 },
      { start: 1200, end: 1300 },
    ])
  })

  it('마지막 블록 이후 꼬리 여백은 마지막 슬라이스에 붙는다', () => {
    const slices = computePageSlices([{ top: 0, bottom: 550 }], 600, 590)
    expect(slices).toEqual([{ start: 0, end: 590 }])
  })
})
