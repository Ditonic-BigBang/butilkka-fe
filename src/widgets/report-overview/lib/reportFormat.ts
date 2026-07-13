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
  버티기: '현재 상태 유지를 추천드려요',
  이동: '새로운 상권을 함께 살펴보세요',
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
  direction: 'up' | 'down'
  change: string
}

/**
 * 대체 상권 핵심 지표 한 줄("유동인구 +6.2%")을 스탯 타일로 파싱.
 * "지표명 ±값" 형태가 아니면 null (스탯 타일 없이 렌더).
 */
export function parseStat(stat: string): RegionStat | null {
  const match = /^(.+?)\s+([+-]\S+)$/.exec(stat.trim())
  if (!match) return null
  const [, label, value] = match
  const up = value.startsWith('+')
  return { label, value, direction: up ? 'up' : 'down', change: up ? '증가' : '감소' }
}
