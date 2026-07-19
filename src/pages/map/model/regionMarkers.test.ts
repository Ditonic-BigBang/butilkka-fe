import { describe, it, expect } from 'vitest'
import type { RegionMapItem, RegionMetricMapItem } from '@/entities/region'
import { METRIC_CONFIG } from './mapCategory'
import { buildGuMarkers, buildMetricGuMarkers, topValueRegionByDistrict } from './regionMarkers'

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

describe('buildMetricGuMarkers', () => {
  const regions: RegionMetricMapItem[] = [
    { regionCode: '1', regionName: '신촌', district: '서대문구', value: 75_000_000 },
    { regionCode: '2', regionName: '이대역', district: '서대문구', value: 100_000_000 },
    { regionCode: '3', regionName: '홍대입구', district: '마포구', value: 50_000_000 },
  ]

  it('구 단위로 묶고 값이 가장 큰 상권으로 대표한다 — 캡션은 표시 단위 값', () => {
    const markers = buildMetricGuMarkers(regions, centroids, METRIC_CONFIG.rentRatio)

    expect(markers).toHaveLength(2)
    const seodaemun = markers.find((m) => m.id === '서대문구')
    expect(seodaemun?.caption).toBe('10,000만원')
    expect(markers.find((m) => m.id === '마포구')?.caption).toBe('5,000만원')
  })

  it('유동인구는 큰 원시값을 만명 단위로 줄여 표시한다', () => {
    const populationRegions: RegionMetricMapItem[] = [
      { regionCode: '1', regionName: '신촌', district: '서대문구', value: 150_000_000 },
      { regionCode: '2', regionName: '홍대입구', district: '마포구', value: 30_000_000 },
    ]

    const markers = buildMetricGuMarkers(populationRegions, centroids, METRIC_CONFIG.footTraffic)

    expect(markers.find((m) => m.id === '서대문구')?.caption).toBe('15,000만명')
    expect(markers.find((m) => m.id === '마포구')?.caption).toBe('3,000만명')
  })

  it('대표 상권 맵은 구 선택 상세 조회용 regionCode 를 준다', () => {
    const top = topValueRegionByDistrict(regions)
    expect(top.get('서대문구')?.regionCode).toBe('2')
  })
})
