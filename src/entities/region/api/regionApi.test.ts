import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRegionMap } from './regionApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('regionApi AbortSignal', () => {
  it('지도 조회의 취소 신호를 실제 fetch까지 전달한다', async () => {
    const signal = new AbortController().signal
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 200,
          status: 'OK',
          message: '성공',
          data: { quarter: '2025Q3', regions: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await fetchRegionMap('2025Q3', signal)

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/regions/map?quarter=2025Q3'),
      expect.objectContaining({ credentials: 'include', signal }),
    )
  })
})
