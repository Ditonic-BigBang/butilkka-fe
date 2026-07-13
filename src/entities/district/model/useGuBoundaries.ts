import { useState, useEffect } from 'react'
import type { LatLngPoint } from '../lib/guCentroids'

// public/seoul-gu.geojson — 서울 자치구 경계 (southkorea/seoul-maps kostat 2013 simple)
export interface GuFeatureProperties {
  code: string
  name: string // "종로구"
  name_eng: string
  base_year: string
}

export interface GuFeature {
  type: 'Feature'
  properties: GuFeatureProperties
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface GuGeoJson {
  type: 'FeatureCollection'
  features: GuFeature[]
}

/** 구 경계 폴리곤 — 지도에 그릴 외곽 링 좌표 묶음 */
export type GuOutline = { district: string; rings: LatLngPoint[][] }

/** GeoJSON 좌표([lng, lat]) → 지도 폴리곤용 외곽 링 목록 (구멍 링 제외) */
export function toGuOutlines(geoJson: GuGeoJson): GuOutline[] {
  return geoJson.features.map((feature) => {
    const { geometry } = feature
    const outerRings =
      geometry.type === 'Polygon'
        ? [(geometry.coordinates as number[][][])[0]]
        : (geometry.coordinates as number[][][][]).map((poly) => poly[0])
    return {
      district: feature.properties.name,
      rings: outerRings.map((ring) => ring.map(([lng, lat]) => ({ lat, lng }))),
    }
  })
}

/** 서울 자치구 경계 geojson (정적 에셋, mock 금지) */
export function useGuBoundaries() {
  const [data, setData] = useState<GuOutline[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/seoul-gu.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<GuGeoJson>
      })
      .then((json) => setData(toGuOutlines(json)))
      .catch((err: Error) => setError(`구 경계 로드 실패: ${err.message}`))
  }, [])

  return { data, error }
}
