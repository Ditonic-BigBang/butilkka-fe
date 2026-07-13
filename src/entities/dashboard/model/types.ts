export interface MetricSeries {
  /** 증감 방향 */
  direction: 'UP' | 'DOWN'
  /** 변화율(%) */
  delta: number
  /** 절대 증감량 (유동인구=명, 점포/폐업=개) */
  gap: number
  /** 최근 3분기 추이 */
  points: { quarter: string; value: number }[]
}

export interface DashboardResponse {
  // 실서버 스웨거엔 district 없음(StoreInfo) — 위치 표기는 address 기반으로 조립
  store: { regionCode: string; regionName: string; categoryName: string; address?: string }
  grade: {
    /** 이번 분기 등급 A~E */
    current: string
    /** 지난 분기 등급 A~E */
    previous: string
    /** 게이지 수치 0~100 */
    gaugeValue: number
  }
  briefing: string
  metrics: { footTraffic: MetricSeries; storeCount: MetricSeries; closureRate: MetricSeries }
}
