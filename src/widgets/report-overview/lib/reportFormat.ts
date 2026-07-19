import type { ReportGrade, ReportRecommendation } from '@/entities/report'

/** 쇠퇴 등급 → 상태 칩 라벨 (CurrentDistrictCard 와 동일 스케일) */
export const GRADE_STATUS: Record<ReportGrade, string> = {
  A: '양호',
  B: '안정',
  C: '주의',
  D: '경계',
  E: '위험',
}

/** AI 추천 유형 → 추천 섹션 타이틀 */
export const RECOMMENDATION_TITLES: Record<ReportRecommendation, string> = {
  버티기: '현 위치 유지를 추천드려요',
  이동: '이동을 추천드려요',
}

/** 대체 상권 섹션 타이틀 — 버티기면 이번 분기 HOT상권, 이동이면 추천 대체 상권 */
export function alternativesTitle(recommendation: ReportRecommendation, quarter: string): string {
  if (recommendation === '이동') return '추천 대체 상권'
  const match = /Q([1-4])$/.exec(quarter)
  return match ? `${match[1]}분기 HOT상권 🔥` : 'HOT상권 🔥'
}

/** RankedDistrictCard 펼침 스탯 타일 형태 */
export type RegionStat = {
  label: string
  value: string
}
