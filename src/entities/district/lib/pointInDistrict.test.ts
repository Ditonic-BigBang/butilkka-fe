import { describe, it, expect } from 'vitest'
import { findDistrictAt } from './pointInDistrict'
import type { GuOutline } from '../model/useGuBoundaries'

// 단순 사각형 두 개 — 서대문구(37.55~37.60, 126.90~126.97), 마포구(37.50~37.55, 126.88~126.95)
const OUTLINES: GuOutline[] = [
  {
    district: '서대문구',
    rings: [
      [
        { lat: 37.55, lng: 126.9 },
        { lat: 37.6, lng: 126.9 },
        { lat: 37.6, lng: 126.97 },
        { lat: 37.55, lng: 126.97 },
      ],
    ],
  },
  {
    district: '마포구',
    rings: [
      [
        { lat: 37.5, lng: 126.88 },
        { lat: 37.55, lng: 126.88 },
        { lat: 37.55, lng: 126.95 },
        { lat: 37.5, lng: 126.95 },
      ],
    ],
  },
]

describe('findDistrictAt', () => {
  it('좌표가 속한 구를 찾는다', () => {
    expect(findDistrictAt({ lat: 37.57, lng: 126.94 }, OUTLINES)).toBe('서대문구')
    expect(findDistrictAt({ lat: 37.52, lng: 126.9 }, OUTLINES)).toBe('마포구')
  })

  it('어느 구에도 없으면 null', () => {
    expect(findDistrictAt({ lat: 37.7, lng: 127.2 }, OUTLINES)).toBeNull()
  })
})
