import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  regionKeys,
  fetchRegionDetail,
  type MetricKey,
  type RegionDetailResponse,
  type RegionGrade,
} from '@/entities/region'
import type { TrendPoint } from '@/shared/ui'
import { DIRECTION_UI, METRIC_CONFIG, type MapCategory } from './mapCategory'

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

// 그래프 라벨: 1분기 포인트만 연도 라벨(x축 tick 과 매칭), 나머지는 고유 라벨
const trendLabel = (quarter: string) => (quarter.endsWith('Q1') ? quarter.slice(0, 4) : quarter)
const yearTicks = (quarters: string[]) =>
  quarters.filter((q) => q.endsWith('Q1')).map((q) => q.slice(0, 4))

function formatTruncatedPercent(value: number) {
  const truncated = Math.trunc(Math.abs(value) * 100) / 100
  return `${truncated.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`
}

/** 쇠퇴등급 상세 시트(GradeBody) 뷰모델 */
export type GradeSheetView = {
  kind: 'grade'
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

/** 수치 지표 상세 시트(MetricBody) 뷰모델 — trend 값은 표시 단위로 변환됨 */
export type MetricSheetView = {
  kind: 'metric'
  subtitle: string
  district: string
  quarterLabel: string
  /** 표시 값 (예: "789") */
  value: string
  /** 단위 (예: "만원") */
  unit: string
  comparison: { label: string; percent: string; direction: 'up' | 'down' | 'same' }
  trend: TrendPoint[]
  trendTicks: string[]
  trendUnit: string
  /** y축 눈금 축약 라벨 (예: 13.4만) — 없으면 기본 포맷 */
  trendAxisLabel?: (value: number) => string
  /** 평균 영업 기간 — 폐업률(closureRate)만 */
  averagePeriod?: { label: string; years: string }
}

export type SheetDetailView = GradeSheetView | MetricSheetView

export function toGradeSheetView(d: RegionDetailResponse): GradeSheetView {
  const trend = d.declineGrade.trend.map((p) => ({
    label: trendLabel(p.quarter),
    value: GRADE_VALUE[p.grade] ?? 3,
  }))

  return {
    kind: 'grade',
    subtitle: `서울 ${d.district}`,
    district: d.district,
    quarterLabel: shortQuarter(d.quarter),
    grade: d.declineGrade.current,
    status: GRADE_STATUS[d.declineGrade.current] ?? '주의',
    lastGrade: `${d.declineGrade.previous}등급`,
    trend,
    trendTicks: yearTicks(d.declineGrade.trend.map((p) => p.quarter)),
  }
}

export function toMetricSheetView(d: RegionDetailResponse, metric: MetricKey): MetricSheetView {
  const config = METRIC_CONFIG[metric]
  const summary = d[metric]
  // 디자인은 증감칩이 전부 % 표기 — 점포수만 changeRate 가 없어(changeCount) 추이 마지막 두 분기로 계산
  const prev = summary.trend.at(-2)?.value
  const percent =
    'changeRate' in summary
      ? formatTruncatedPercent(summary.changeRate)
      : prev
        ? formatTruncatedPercent((Math.abs(summary.value - prev) / prev) * 100)
        : `${Math.abs(summary.changeCount)}${config.unit}`

  return {
    kind: 'metric',
    subtitle: `서울 ${d.district}`,
    district: d.district,
    quarterLabel: shortQuarter(d.quarter),
    value: config.toDisplayValue(summary.value).toLocaleString(),
    unit: config.unit,
    comparison: {
      label: '이전 분기 대비',
      percent,
      direction: DIRECTION_UI[summary.direction] ?? 'same',
    },
    trend: summary.trend.map((p) => ({
      label: trendLabel(p.quarter),
      value: config.toTrendValue(p.value),
    })),
    trendTicks: yearTicks(summary.trend.map((p) => p.quarter)),
    trendUnit: `(${config.trendUnit})`,
    trendAxisLabel: config.toAxisLabel,
    averagePeriod:
      'avgOperatingYears' in summary
        ? { label: `서울 ${d.district}`, years: String(summary.avgOperatingYears) }
        : undefined,
  }
}

/**
 * 특정 상권(구 대표) 상세 — `GET /districts/{regionCode}` (quarter 미지정 시 최신 분기).
 * 응답 하나에 등급·수치 지표가 모두 담겨 있어 카테고리는 select 에서 뷰모델만 갈아끼운다.
 * regionCode 가 없으면 조회하지 않는다. 구/분기 전환 시 이전 데이터를 유지해 시트 깜빡임을 막는다.
 */
export function useRegionDetail(
  regionCode: string | null,
  category: MapCategory = 'grade',
  quarter?: string,
) {
  return useQuery({
    queryKey: regionKeys.detail(regionCode ?? '', quarter),
    queryFn: ({ signal }) => fetchRegionDetail(regionCode as string, quarter, signal),
    enabled: regionCode !== null,
    select: (d: RegionDetailResponse): SheetDetailView =>
      category === 'grade' ? toGradeSheetView(d) : toMetricSheetView(d, category),
    placeholderData: keepPreviousData,
  })
}
