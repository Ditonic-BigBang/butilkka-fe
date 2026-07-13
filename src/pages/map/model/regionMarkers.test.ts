import { describe, it, expect } from 'vitest'
import type { RegionMapItem } from '@/entities/region'
import { buildGuMarkers } from './regionMarkers'

const centroids = new Map([
  ['서대문구', { lat: 37.57, lng: 126.94 }],
  ['마포구', { lat: 37.55, lng: 126.9 }],
])

describe('buildGuMarkers', () => {
  it('구 단위로 묶고 가장 위험한(E 쪽) 등급으로 대표한다', () => {
    const regions: RegionMapItem[] = [
      { regionCode: '1', regionName: '신촌', district: '서대문구', grade: 'C' },
      { regionCode: '2', regionName: '이대역', district: '서대문구', grade: 'E' },
      { regionCode: '3', regionName: '홍대입구', district: '마포구', grade: 'B' },
    ]

    const markers = buildGuMarkers(regions, centroids)

    expect(markers).toHaveLength(2)
    const seodaemun = markers.find((m) => m.id === '서대문구')
    expect(seodaemun?.title).toBe('서대문구')
    expect(seodaemun?.caption).toBe('E등급')
    // 좌표는 구 센트로이드에서
    expect(seodaemun?.lat).toBe(37.57)
    expect(seodaemun?.lng).toBe(126.94)
  })

  it('센트로이드가 없는 구는 마커를 만들지 않는다', () => {
    const markers = buildGuMarkers(
      [{ regionCode: '9', regionName: '어딘가', district: '고양시', grade: 'A' }],
      centroids,
    )
    expect(markers).toHaveLength(0)
  })
})
