import { useState, useEffect } from 'react'

export interface SeoulFeatureProperties {
  adm_nm: string // "서울특별시 종로구 사직동"
  adm_cd: string // 행정동 코드
  sggnm: string // "종로구"  ← 구 이름
  sidonm: string // "서울특별시"
}

export interface SeoulFeature {
  type: 'Feature'
  properties: SeoulFeatureProperties
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface SeoulGeoJson {
  type: 'FeatureCollection'
  features: SeoulFeature[]
}

export function useSeoulGeoJson() {
  const [data, setData] = useState<SeoulGeoJson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/seoul.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<SeoulGeoJson>
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(`GeoJSON 로드 실패: ${err.message}`)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
