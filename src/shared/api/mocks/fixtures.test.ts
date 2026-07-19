import { describe, expect, it } from 'vitest'
import { getMetricMapMock, makeRegionDetailMock, regionMapMock } from './fixtures'

describe('지도 유동인구 목데이터', () => {
  it('6천만 명 안팎의 값을 사용하고 지도와 상세의 선택 분기 값이 일치한다', () => {
    const map = getMetricMapMock('footTraffic', '2025Q4')
    const region = regionMapMock.regions.find((item) => item.regionCode === '3110002')

    expect(map).not.toBeNull()
    expect(region).toBeDefined()
    expect(map?.regions.every((item) => item.value >= 50_000_000 && item.value < 70_000_000)).toBe(
      true,
    )

    const mapRegion = map?.regions.find((item) => item.regionCode === region?.regionCode)
    const detail = makeRegionDetailMock(region!, '2025Q4')

    expect(mapRegion?.value).toBe(67_150_000)
    expect(detail.footTraffic.value).toBe(mapRegion?.value)
    expect(detail.footTraffic.trend.at(-1)?.value).toBe(mapRegion?.value)
  })
})

describe('지도 점포당 평균 분기매출 목데이터', () => {
  it('천만원대부터 1억원까지 분포하고 지도와 상세의 선택 분기 값이 일치한다', () => {
    const map = getMetricMapMock('rentRatio', '2025Q4')
    const region = regionMapMock.regions.find((item) => item.regionCode === '3110002')

    expect(map).not.toBeNull()
    expect(region).toBeDefined()
    expect(
      map?.regions.every((item) => item.value >= 10_000_000 && item.value <= 100_000_000),
    ).toBe(true)

    const mapRegion = map?.regions.find((item) => item.regionCode === region?.regionCode)
    const detail = makeRegionDetailMock(region!, '2025Q4')

    expect(mapRegion?.value).toBe(100_000_000)
    expect(detail.rentRatio.value).toBe(mapRegion?.value)
    expect(detail.rentRatio.trend.at(-1)?.value).toBe(mapRegion?.value)
  })
})
