import { formatQuarter } from '@/shared/lib/quarter'
import { formatDecimal, formatNumber } from '@/shared/lib/formatNumber'
import type { ReportAlternativeRegion, ReportGrade, ReportResponse } from '@/entities/report'
import {
  alternativesTitle,
  GRADE_STATUS,
  RECOMMENDATION_TITLES,
  type RegionStat,
} from '../lib/reportFormat'

/**
 * 상권 점수 카드의 게이지는 연속 점수가 아니라 A~E 등급을 시각화한다.
 * 백엔드 score 값과 무관하게 개발·배포 환경에서 같은 위치를 사용한다.
 */
export const GRADE_GAUGE_PROGRESS: Record<ReportGrade, number> = {
  A: 0.16,
  B: 0.38,
  C: 0.64,
  D: 0.91,
  E: 1,
}

/** AI 리포트 본문에 필요한 데이터 묶음 (뷰모델) — 최신/지난 리포트 화면이 공유 */
export type ReportView = {
  /** 리포트 아이디 — 유사 사례 전체 보기 등 하위 라우팅용 */
  reportId: number
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
  /** A~E 등급에 대응하는 고정 위험도 게이지 0~1 */
  progress: number
  briefing: string
  aiOutlook: string
  causes: { label: string; value: string }[]
  signals: string[]
  similarCases: { caseId: string; region: string; period: string; summary: string }[]
  /** AI 추천 뱃지. 현재 기본값은 "AI 추천" */
  recommendationBadge: string
  /** AI 추천 섹션 타이틀 (추천 유형에서 유도) */
  recommendationTitle: string
  /** 추천 이유 카드 (소제목 + 근거) */
  reason: { title: string; description: string }
  alternativesTitle: string
  alternatives: {
    rank: number
    name: string
    description?: string
    stats: RegionStat[]
    /** 지표 기준 시점 표시 (예: "26.03 기준") */
    referenceDate?: string
  }[]
}

/** API 원시 수치를 대안 상권 카드의 표시 단위로 변환한다. null인 지표는 숨긴다. */
function toRegionStats(r: ReportAlternativeRegion): RegionStat[] {
  const stats: RegionStat[] = []

  if (r.storeCount != null) {
    stats.push({ label: '점포 수', value: `${formatNumber(r.storeCount)}개` })
  }
  if (r.floatingPopulation != null) {
    // 실서버 값은 억 단위(예: 112,084,721)라 소수점은 노이즈 — 지도(mapCategory)와 동일하게 정수 만명
    stats.push({
      label: '유동인구',
      value: `${formatNumber(Math.round(r.floatingPopulation / 10_000))}만명`,
    })
  }
  if (r.vacancy != null) {
    stats.push({ label: '공실률', value: `${formatDecimal(r.vacancy)}%` })
  }

  return stats
}

function nonEmpty(value: string | null, fallback: string): string {
  return value?.trim() || fallback
}

/** 리포트 응답(DTO) → 본문 뷰모델. react-query `select` 로 쓴다. */
export function toReportView(d: ReportResponse): ReportView {
  return {
    reportId: d.reportId,
    regionName: d.regionName,
    categoryName: d.categoryName,
    quarter: d.quarter,
    period: formatQuarter(d.quarter),
    declineType: d.declineType,
    grade: `${d.grade}등급`,
    status: GRADE_STATUS[d.grade],
    progress: GRADE_GAUGE_PROGRESS[d.grade],
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
    recommendationBadge: d.aiRecommendation.badgeType,
    recommendationTitle: nonEmpty(
      d.aiRecommendation.title,
      RECOMMENDATION_TITLES[d.decision.recommendation],
    ),
    reason: {
      title: nonEmpty(d.aiRecommendation.reasonTitle, d.decision.title),
      description: nonEmpty(d.aiRecommendation.reasonDetail, d.decision.description),
    },
    alternativesTitle: alternativesTitle(d.decision.recommendation, d.quarter),
    alternatives: d.alternativeRegions.map((r) => ({
      rank: r.rank,
      name: r.regionName,
      description: r.aiMessage?.trim() || undefined,
      stats: toRegionStats(r),
      referenceDate: r.baseDate ? `${formatQuarter(r.baseDate)} 기준` : undefined,
    })),
  }
}
