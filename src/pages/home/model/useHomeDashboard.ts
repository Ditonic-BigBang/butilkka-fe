import { useQuery } from '@tanstack/react-query'
import {
  dashboardKeys,
  fetchDashboard,
  type DashboardResponse,
  type MetricSeries,
} from '@/entities/dashboard'
import type { SparkPoint } from '@/shared/ui'

/** 홈 지표 카드 1개 (유동인구·점포수·폐업률) */
export type HomeMetric = {
  title: string
  value: string
  /** 값 옆 증감(개수) 칩 — 생략 시 미표시 (폐업률은 현재 숨김) */
  change?: { direction: 'up' | 'down'; label: string }
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

// ── DTO → 뷰모델 매핑 ────────────────────────────────────────────
// "2026Q1" → "1분기"
const quarterLabel = (quarter: string) => `${quarter.slice(-1)}분기`

// 변화율(%) 표시 — 소수점 둘째 자리까지 반올림, 뒤 0 은 안 붙는다 (18 → "18", 9299.3131 → "9,299.31").
// 표시 자릿수는 화면 정책이라 FE 에서 처리한다 — 백엔드는 원값 그대로.
// 부호는 direction 으로 붙이므로 delta 가 음수로 와도 이중 부호가 안 생기게 절댓값 사용.
const formatDelta = (n: number) => Math.abs(n).toLocaleString('ko-KR', { maximumFractionDigits: 2 })

// withChange=false 면 개수 칩을 숨긴다(폐업률). m.gap 은 그대로라 다시 켜기는 인자만 바꾸면 됨.
function toMetric(title: string, unit: string, m: MetricSeries, withChange = true): HomeMetric {
  const sign = m.direction === 'UP' ? '+' : '-'
  return {
    title,
    value: `${sign}${formatDelta(m.delta)}%`,
    change: withChange
      ? {
          direction: m.direction === 'UP' ? 'up' : 'down',
          label: `${m.gap.toLocaleString('ko-KR')}${unit}`,
        }
      : undefined,
    // 스파크라인은 내부에서 min-max 정규화하므로 원값을 그대로 넘긴다.
    trend: m.points.map((p) => ({ label: quarterLabel(p.quarter), value: p.value })),
  }
}

function toHomeDashboard(d: DashboardResponse): HomeDashboard {
  return {
    // 위치 pill 폴백 — 주소에서 "서울" 접두만 떼서 표시(HomePage 의 user.store.address 표기와 동일 규칙)
    location: d.store.address?.replace(/^서울(특별시)?\s+/, '') ?? d.store.regionName,
    grade: d.grade.current as HomeDashboard['grade'],
    lastGrade: `${d.grade.previous}등급`,
    briefing: d.briefing,
    metrics: {
      floating: toMetric('유동인구', '명', d.metrics.footTraffic),
      stores: toMetric('점포수', '개', d.metrics.storeCount),
      // 폐업률은 개수 칩 숨김(디자인 변경) — 다시 켜려면 마지막 인자 제거/ true
      closure: toMetric('폐업률', '개', d.metrics.closureRate, false),
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
