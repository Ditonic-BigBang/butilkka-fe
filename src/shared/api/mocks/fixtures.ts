// MSW 핸들러·Storybook 스토리가 공유하는 목 픽스처 — API명세서 V3 응답(data) 형태.
// shared 는 상위 레이어를 import 하지 않으므로 DTO 타입은 같은 shared/api 에서 가져온다(FSD).
import type {
  DashboardResponse,
  NotificationListResponse,
  ReportHistoryResponse,
  ReportRecommendation,
  ReportResponse,
} from '@/shared/api/types'

/** GET /api/v1/dashboard 데모 데이터 (명세 예시 기반) */
export const dashboardMock: DashboardResponse = {
  store: {
    regionCode: '3110001',
    district: '마포구',
    regionName: '가로수길',
    categoryName: '한식음식점',
  },
  grade: { current: 'C', previous: 'B', gaugeValue: 52 },
  briefing: '전년 대비 유동인구가 줄고 공실이 늘고 있어,\n주의가 필요한 구간이에요.',
  metrics: {
    footTraffic: {
      direction: 'DOWN',
      delta: 18,
      gap: 1215,
      points: [
        { quarter: '2025Q3', value: 132423 },
        { quarter: '2025Q4', value: 128110 },
        { quarter: '2026Q1', value: 121940 },
      ],
    },
    storeCount: {
      direction: 'DOWN',
      delta: 12,
      gap: 47,
      points: [
        { quarter: '2025Q3', value: 412 },
        { quarter: '2025Q4', value: 405 },
        { quarter: '2026Q1', value: 398 },
      ],
    },
    closureRate: {
      direction: 'UP',
      delta: 18,
      gap: 94,
      points: [
        { quarter: '2025Q3', value: 3.1 },
        { quarter: '2025Q4', value: 3.4 },
        { quarter: '2026Q1', value: 3.9 },
      ],
    },
  },
}

// 추천 유형별 AI 의사결정(decision) 카피 — 화면의 추천 타이틀·추천 이유 카드에 쓰인다.
const REPORT_DECISIONS: Record<ReportRecommendation, ReportResponse['decision']> = {
  이동: {
    recommendation: '이동',
    title: '장기적인 쇠퇴 예상',
    description:
      '업종 경쟁력 약화와 배후 인구 감소로 인한 장기적인 쇠퇴가 예상됩니다. 현재 업종은 한식음식점으로, 주변 상권에 동종 점포 23곳이 밀집되어 있어 경쟁이 치열하며, 유동인구 감소가 지속되고 있어 인구 유입이 늘고 있는 상권으로 이동을 권장합니다.',
  },
  버티기: {
    recommendation: '버티기',
    title: '지속적인 인구 유입 증가 추세',
    description:
      '쇠퇴 신호가 일부 나타나지만 배후 인구 유입이 꾸준히 늘고 있습니다. 현재 업종은 한식음식점으로 상권 내 경쟁 밀집도가 낮고, 서울시 상권 재생 정책 대상지로 지정되어 있어 현 위치에서 회복 국면을 기다리는 것을 권장합니다.',
  },
}

/**
 * GET /api/v1/reports/latest 데모 데이터 (명세 예시 + Figma [3-1] 기본 카피 기반).
 * 추천 유형(이동/버티기)에 따라 decision 만 갈리고 나머지는 동일 — 홈 대시보드 목과
 * 같은 가게(가로수길 · 한식음식점 · C등급) 기준으로 맞춘다.
 */
export function makeReportMock(recommendation: ReportRecommendation = '이동'): ReportResponse {
  return {
    reportId: 17,
    regionCode: '3110001',
    regionName: '가로수길',
    categoryName: '한식음식점',
    districtName: '마포구',
    quarter: '2026Q2',
    grade: 'C',
    declineType: '쇠퇴형',
    score: 64,
    briefing:
      '현재 상권은 회복보다 쇠퇴 신호가 강하게 나타나고\n있어요. 지금 바로 대응이 필요해요.',
    aiOutlook:
      '가로수길은 향후 1년간 유동인구 감소와 공실 증가, 그리고 임대료 상승 압력이라는 선행 지표로 인해, 과거 광화문·이태원 상권과 유사한 구조적 침체 초입 국면에 진입할 가능성이 높습니다. 다만 서울시 상권 재생 정책 개입 여부에 따라 회복 경로가 갈릴 수 있습니다.',
    causes: [
      { title: '유동인구 감소', level: '높음' },
      { title: '오피스 공실률 상승', level: '중간' },
      { title: '임대료 상승', level: '낮음' },
    ],
    leadingSignals: [
      { title: '무인 점포 증가율 증가', description: '무인 운영 점포 비중이 빠르게 늘고 있어요' },
      { title: '요식업 폐업 신호 증가', description: '동종 업종 폐업 전 신호가 늘고 있어요' },
      { title: '유동인구 야간시간대 감소', description: '야간 방문 인구가 줄고 있어요' },
    ],
    similarCases: [
      {
        caseId: '7c9e6b2a-1f34-4d8a-9b21-3e5f8a0c1d22',
        regionCode: '3170011',
        regionName: '광화문',
        summary: '오피스 공실이 선행되며 1층 상권 도미노 침체 → 2022년 일부 회복',
        period: { startYear: 2018, endYear: 2020 },
      },
      {
        caseId: '3f2a8c1d-5b67-4e90-8a12-9c4d7e6f0b31',
        regionCode: '3170012',
        regionName: '경리단길',
        summary: '젠트리피케이션 이후 유동인구 급감으로 침체한 유사 사례',
        period: { startYear: 2018, endYear: 2021 },
      },
    ],
    decision: REPORT_DECISIONS[recommendation],
    alternativeRegions: [
      {
        rank: 1,
        regionCode: '3110021',
        regionName: '망원동',
        reason: '2026년 1분기부터 2분기까지 유동인구 증가율이 88% 증가했어요.',
        stat: '유동인구 +88%',
      },
      {
        rank: 2,
        regionCode: '3110022',
        regionName: '성수동',
        reason: '유동인구 증가율이 82% 상승했으며, 최근 성수동 공실률이 3.7%로 낮은 편이에요.',
        stat: '유동인구 +82%',
      },
      {
        rank: 3,
        regionCode: '3110023',
        regionName: '한남동',
        reason: '유동인구 증가율이 79% 상승했으며, 2025년 1분기부터 꾸준히 증가 추세에요.',
        stat: '유동인구 +79%',
      },
    ],
  }
}

/** GET /api/v1/reportsHistory 데모 데이터 — 최신(2026Q2)부터 내림차순 */
export const reportHistoryMock: ReportHistoryResponse = {
  totalCount: 4,
  hasNext: false,
  reports: [
    {
      reportId: 17,
      quarter: '2026Q2',
      grade: 'C',
      briefing: '유동인구 감소와 공실 증가가 겹치는 주의 구간입니다.',
    },
    {
      reportId: 12,
      quarter: '2026Q1',
      grade: 'B',
      briefing: '유동인구가 소폭 줄었지만 매출 지표는 안정적입니다.',
    },
    {
      reportId: 8,
      quarter: '2025Q4',
      grade: 'B',
      briefing: '연말 특수로 유동인구가 일시 회복했습니다.',
    },
    { reportId: 5, quarter: '2025Q3', grade: 'A', briefing: '상권 활력이 높게 유지되고 있습니다.' },
  ],
}

const pad2 = (n: number) => String(n).padStart(2, '0')

// sentAt(ISO, 오프셋 없음) 문자열을 "N분 전" 기준으로 생성 → 데모에서 "14분전" 같은 상대시간 표시.
function minutesAgo(minutes: number): string {
  const d = new Date(Date.now() - minutes * 60_000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/**
 * GET /api/v1/notifications 데모 데이터.
 * 매 호출마다 새 객체를 반환 — 핸들러 상태와 스토리 시드가 서로 오염되지 않게.
 */
export function makeNotificationsMock(): NotificationListResponse {
  return {
    totalCount: 3,
    hasNext: false,
    notifications: [
      {
        notificationId: 301,
        category: 'REPORT',
        title: '2026년 1분기 AI 리포트가 발행됐어요',
        content: '가로수길 상권의 2026년 1분기 리포트를 확인해보세요.',
        isRead: false,
        sentAt: minutesAgo(14),
      },
      {
        notificationId: 302,
        category: 'EMERGENCY',
        title: '상권 등급이 B→C로 변경되었어요',
        content: '가로수길 상권의 이번 분기 등급이 하락했습니다.',
        isRead: true,
        sentAt: minutesAgo(60 * 5),
      },
      {
        notificationId: 303,
        category: 'REPORT',
        title: '2025년 4분기 AI 리포트가 발행됐어요',
        content: '가로수길 상권의 2025년 4분기 리포트를 확인해보세요.',
        isRead: true,
        sentAt: '2025-12-25T09:00:00',
      },
    ],
  }
}
