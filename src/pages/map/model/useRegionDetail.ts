import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  regionKeys,
  fetchRegionDetail,
  type RegionDetailResponse,
  type RegionGrade,
} from '@/entities/region'
import type { TrendPoint } from '@/shared/ui'

// TrendGraph grade 변형 값 축 (A=5 … E=1)
const GRADE_VALUE: Record<RegionGrade, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 }
// 등급 → 상태 라벨 (Figma 쇠퇴등급(특정): C=주의)
const GRADE_STATUS: Record<RegionGrade, string> = {
  A: '안전',
  B: '양호',
  C: '주의',
  D: '위험',
  E: '심각',
}

// "2026Q1" → "26년 1분기"
function shortQuarter(quarter: string): string {
  const match = /^\d{2}(\d{2})Q([1-4])$/.exec(quarter)
  if (!match) return quarter
  return `${match[1]}년 ${match[2]}분기`
}

/** 쇠퇴등급 상세 시트(DistrictSheet grade) 뷰모델 */
export type GradeSheetView = {
  /** 시트 부제 (예: "서울 서대문구") */
  subtitle: string
  /** 지도 이동용 자치구명 */
  district: string
  quarterLabel: string
  grade: RegionGrade
  status: string
  lastGrade: string
  trend: TrendPoint[]
  trendTicks: string[]
}

export function toGradeSheetView(d: RegionDetailResponse): GradeSheetView {
  // 그래프 라벨: 1분기 포인트만 연도 라벨(x축 tick 과 매칭), 나머지는 고유 라벨
  const trend = d.declineGrade.trend.map((p) => ({
    label: p.quarter.endsWith('Q1') ? p.quarter.slice(0, 4) : p.quarter,
    value: GRADE_VALUE[p.grade] ?? 3,
  }))
  const trendTicks = d.declineGrade.trend
    .filter((p) => p.quarter.endsWith('Q1'))
    .map((p) => p.quarter.slice(0, 4))

  return {
    subtitle: `서울 ${d.district}`,
    district: d.district,
    quarterLabel: shortQuarter(d.quarter),
    grade: d.declineGrade.current,
    status: GRADE_STATUS[d.declineGrade.current] ?? '주의',
    lastGrade: `${d.declineGrade.previous}등급`,
    trend,
    trendTicks,
  }
}

/**
 * 특정 상권(구 대표) 쇠퇴등급 상세 — `GET /districts/{regionCode}`.
 * regionCode 가 없으면 조회하지 않는다. 구 전환 시 이전 데이터를 유지해 시트 깜빡임을 막는다.
 */
export function useRegionDetail(regionCode: string | null) {
  return useQuery({
    queryKey: regionKeys.detail(regionCode ?? ''),
    queryFn: () => fetchRegionDetail(regionCode as string),
    enabled: regionCode !== null,
    select: toGradeSheetView,
    placeholderData: keepPreviousData,
  })
}
