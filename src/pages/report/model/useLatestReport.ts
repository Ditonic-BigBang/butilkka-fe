import { useQuery } from '@tanstack/react-query'
import { fetchLatestReport, fetchReportHistory, reportKeys } from '@/entities/report'
import { formatQuarter } from '@/shared/lib/quarter'
import type {
  ReportAlternativeRegion,
  ReportHistoryResponse,
  ReportResponse,
} from '@/shared/api/types'
import {
  alternativesTitle,
  GRADE_STATUS,
  parseStat,
  RECOMMENDATION_TITLES,
  type RegionStat,
} from '../lib/reportFormat'

/** AI 리포트 화면에 필요한 데이터 묶음 (뷰모델) */
export type ReportView = {
  regionName: string
  categoryName: string
  /** 분기 원문 ("2026Q2") — 히스토리에서 이전 리포트를 찾을 때 비교용 */
  quarter: string
  /** 분기 표시 (예: "2026년 2분기") */
  period: string
  declineType: string
  /** 표시 등급 (예: "C등급") */
  grade: string
  /** 상태 칩 (예: "주의") */
  status: string
  /** 위험도 게이지 0~1 */
  progress: number
  briefing: string
  aiOutlook: string
  causes: { label: string; value: string }[]
  signals: string[]
  similarCases: { caseId: string; region: string; period: string; summary: string }[]
  /** AI 추천 섹션 타이틀 (추천 유형에서 유도) */
  recommendationTitle: string
  /** 추천 이유 카드 (소제목 + 근거) */
  reason: { title: string; description: string }
  alternativesTitle: string
  alternatives: {
    rank: number
    name: string
    description: string
    stats: RegionStat[]
    /** 지표 기준 시점 표시 (예: "26.03 기준") */
    referenceDate?: string
  }[]
}

// ── DTO → 뷰모델 매핑 ────────────────────────────────────────────
// 상세 지표(stats·선규격)가 있으면 타일 3개, 없으면 핵심 지표 한 줄(stat)을 타일 1개로 폴백
function toRegionStats(r: ReportAlternativeRegion): RegionStat[] {
  if (r.stats?.length) {
    return r.stats.map((s) => ({
      label: s.label,
      value: s.value,
      direction: s.direction === 'UP' ? 'up' : 'down',
      change: s.note,
    }))
  }
  const parsed = parseStat(r.stat)
  return parsed ? [parsed] : []
}

function toReportView(d: ReportResponse): ReportView {
  return {
    regionName: d.regionName,
    categoryName: d.categoryName,
    quarter: d.quarter,
    period: formatQuarter(d.quarter),
    declineType: d.declineType,
    grade: `${d.grade}등급`,
    status: GRADE_STATUS[d.grade],
    progress: Math.min(Math.max(d.score / 100, 0), 1),
    briefing: d.briefing,
    aiOutlook: d.aiOutlook,
    causes: d.causes.map((c) => ({ label: c.title, value: c.level })),
    signals: d.leadingSignals.map((s) => s.title),
    similarCases: d.similarCases.map((c) => ({
      caseId: c.caseId,
      region: c.regionName,
      period: `${c.period.startYear}~${c.period.endYear}`,
      summary: c.summary,
    })),
    recommendationTitle: RECOMMENDATION_TITLES[d.decision.recommendation],
    reason: { title: d.decision.title, description: d.decision.description },
    alternativesTitle: alternativesTitle(d.decision.recommendation, d.quarter),
    alternatives: d.alternativeRegions.map((r) => ({
      rank: r.rank,
      name: r.regionName,
      description: r.reason,
      stats: toRegionStats(r),
      referenceDate: r.referenceDate ? `${r.referenceDate} 기준` : undefined,
    })),
  }
}

/**
 * 최신 분기 리포트 데이터 소스.
 * `GET /api/v1/reports/latest` 응답(DTO)을 `select` 로 화면 뷰모델(ReportView)로 변환한다.
 */
export function useLatestReport() {
  return useQuery({
    queryKey: reportKeys.latest(),
    queryFn: fetchLatestReport,
    select: toReportView,
  })
}

/** 리포트 히스토리 — 이전 리포트 이동 버튼(분기·등급)에 쓴다. 최신 분기부터 내림차순 정렬. */
export function useReportHistory() {
  return useQuery({
    queryKey: reportKeys.history(),
    queryFn: fetchReportHistory,
    select: (d: ReportHistoryResponse) =>
      d.reports.toSorted((a, b) => b.quarter.localeCompare(a.quarter)),
  })
}
