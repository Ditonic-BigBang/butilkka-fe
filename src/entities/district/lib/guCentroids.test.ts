import { describe, expect, it } from 'vitest'
import { computeGuCentroids } from './guCentroids'

describe('computeGuCentroids', () => {
  it('폴리곤의 면적 중심점을 계산한다', () => {
    const centroids = computeGuCentroids([
      {
        district: '테스트구',
        rings: [
          [
            { lat: 0, lng: 0 },
            { lat: 0, lng: 4 },
            { lat: 2, lng: 4 },
            { lat: 2, lng: 0 },
          ],
        ],
      },
    ])

    expect(centroids.get('테스트구')).toEqual({ lat: 1, lng: 2 })
  })

  it('MultiPolygon 링은 면적에 비례해 하나의 중심점으로 합친다', () => {
    const centroids = computeGuCentroids([
      {
        district: '섬구',
        rings: [
          [
            { lat: 0, lng: 0 },
            { lat: 0, lng: 2 },
            { lat: 2, lng: 2 },
            { lat: 2, lng: 0 },
          ],
          [
            { lat: 0, lng: 4 },
            { lat: 0, lng: 5 },
            { lat: 1, lng: 5 },
            { lat: 1, lng: 4 },
          ],
        ],
      },
    ])

    expect(centroids.get('섬구')?.lat).toBeCloseTo(0.9)
    expect(centroids.get('섬구')?.lng).toBeCloseTo(1.7)
  })
})
