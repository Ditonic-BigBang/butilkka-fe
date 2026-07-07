import { useQuery } from '@tanstack/react-query'
import { apiJson } from '@/shared/api/api'
import type { DashboardResponse, MetricSeries } from '@/shared/api/types'
import type { SparkPoint } from '@/shared/ui'

/** 홈 지표 카드 1개 (유동인구·점포수·폐업률) */
export type HomeMetric = {
  title: string
  value: string
  change: { direction: 'up' | 'down'; label: string }
  trend: SparkPoint[]
}

/** 홈 대시보드 화면에 필요한 데이터 묶음 (뷰모델) */
export type HomeDashboard = {
  location: string
  grade: 'A' | 'B' | 'C' | 'D' | 'E'
  lastGrade: string
  briefing: string
  metrics: { floating: HomeMetric; stores: HomeMetric; closure: HomeMetric }
}

/** dashboard 쿼리 키 팩토리 (TkDodo 패턴) */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: () => [...dashboardKeys.all, 'detail'] as const,
}

/** GET /api/v1/dashboard (명세: envelope.data = DashboardResponse) */
function fetchDashboard(): Promise<DashboardResponse> {
  return apiJson<DashboardResponse>('/api/v1/dashboard')
}

// ── DTO → 뷰모델 매핑 ────────────────────────────────────────────
// "2026Q1" → "1분기"
const quarterLabel = (quarter: string) => `${quarter.slice(-1)}분기`

function toMetric(title: string, unit: string, m: MetricSeries): HomeMetric {
  const sign = m.direction === 'UP' ? '+' : '-'
  return {
    title,
    value: `${sign}${m.delta}%`,
    change: {
      direction: m.direction === 'UP' ? 'up' : 'down',
      label: `${m.gap.toLocaleString('ko-KR')}${unit}`,
    },
    // 스파크라인은 내부에서 min-max 정규화하므로 원값을 그대로 넘긴다.
    trend: m.points.map((p) => ({ label: quarterLabel(p.quarter), value: p.value })),
  }
}

function toHomeDashboard(d: DashboardResponse): HomeDashboard {
  return {
    location: `${d.store.district} ${d.store.regionName}`,
    grade: d.grade.current as HomeDashboard['grade'],
    lastGrade: `${d.grade.previous}등급`,
    briefing: d.briefing,
    metrics: {
      floating: toMetric('유동인구', '명', d.metrics.footTraffic),
      stores: toMetric('점포수', '개', d.metrics.storeCount),
      closure: toMetric('폐업률', '개', d.metrics.closureRate),
    },
  }
}

/**
 * 홈 대시보드 데이터 소스.
 * `GET /api/v1/dashboard` 응답(DTO)을 `select` 로 화면 뷰모델(HomeDashboard)로 변환한다.
 * MSW off + 실서버 전환 시에도 소비처(HomePage)는 그대로다.
 */
export function useHomeDashboard() {
  return useQuery({
    queryKey: dashboardKeys.detail(),
    queryFn: fetchDashboard,
    select: toHomeDashboard,
  })
}
