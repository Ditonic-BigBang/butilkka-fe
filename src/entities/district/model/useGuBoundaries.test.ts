import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { toGuGeometry, type GuGeoJson } from './useGuBoundaries'

describe('toGuGeometry', () => {
  it('56KB 자치구 파일 하나에서 25개 경계와 중심점을 함께 만든다', () => {
    const filePath = resolve(process.cwd(), 'public/seoul-gu.geojson')
    const geoJson = JSON.parse(readFileSync(filePath, 'utf8')) as GuGeoJson
    const geometry = toGuGeometry(geoJson)

    expect(geometry.boundaries).toHaveLength(25)
    expect(geometry.centroids.size).toBe(25)
    geometry.centroids.forEach(({ lat, lng }) => {
      expect(lat).toBeGreaterThan(37)
      expect(lat).toBeLessThan(38)
      expect(lng).toBeGreaterThan(126)
      expect(lng).toBeLessThan(128)
    })
  })
})
