// MSW 핸들러·Storybook 스토리가 공유하는 목 픽스처 — API명세서 V3 응답(data) 형태.
// shared 는 상위 레이어를 import 하지 않으므로 DTO 타입은 같은 shared/api 에서 가져온다(FSD).
import type {
  DashboardResponse,
  NotificationListResponse,
  ReportCasesResponse,
  ReportGrade,
  ReportHistoryItem,
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
        stats: [
          { label: '점포수', value: '+12개', direction: 'UP', note: '증가' },
          { label: '유동인구', value: '+8,420', direction: 'UP', note: '명/일' },
          { label: '공실', value: '-3건', direction: 'DOWN', note: '감소' },
        ],
        referenceDate: '26.03',
      },
      {
        rank: 2,
        regionCode: '3110022',
        regionName: '성수동',
        reason: '유동인구 증가율이 82% 상승했으며, 최근 성수동 공실률이 3.7%로 낮은 편이에요.',
        stat: '유동인구 +82%',
        stats: [
          { label: '점포수', value: '+9개', direction: 'UP', note: '증가' },
          { label: '유동인구', value: '+6,180', direction: 'UP', note: '명/일' },
          { label: '공실', value: '-2건', direction: 'DOWN', note: '감소' },
        ],
        referenceDate: '26.03',
      },
      {
        rank: 3,
        regionCode: '3110023',
        regionName: '한남동',
        reason: '유동인구 증가율이 79% 상승했으며, 2025년 1분기부터 꾸준히 증가 추세에요.',
        stat: '유동인구 +79%',
        stats: [
          { label: '점포수', value: '+5개', direction: 'UP', note: '증가' },
          { label: '유동인구', value: '+4,930', direction: 'UP', note: '명/일' },
          { label: '공실', value: '-1건', direction: 'DOWN', note: '감소' },
        ],
        referenceDate: '26.03',
      },
    ],
  }
}

// 등급 → 데모 쇠퇴 위험도 점수 (지난 리포트 상세 목 생성용)
const GRADE_SCORES: Record<ReportGrade, number> = { A: 16, B: 38, C: 64, D: 82, E: 94 }

/**
 * GET /api/v1/reports/{reportId} 데모 데이터 — 히스토리 항목의 분기·등급·브리핑을
 * 최신 리포트 목에 덮어쓴다. 등급이 좋으면(A·B) '버티기', 나쁘면 '이동' 추천으로
 * 데모에서 두 추천 상태를 모두 볼 수 있게 한다.
 */
export function makeReportDetailMock(item: ReportHistoryItem): ReportResponse {
  const recommendation = item.grade === 'A' || item.grade === 'B' ? '버티기' : '이동'
  return {
    ...makeReportMock(recommendation),
    reportId: item.reportId,
    quarter: item.quarter,
    grade: item.grade,
    score: GRADE_SCORES[item.grade],
    briefing: item.briefing,
  }
}

/** GET /api/v1/reports/{reportId}/cases 데모 데이터 — 리포트의 유사 상권 사례 전체 */
export const reportCasesMock: ReportCasesResponse = {
  totalCount: 5,
  cases: [
    {
      caseId: '7c9e6b2a-1f34-4d8a-9b21-3e5f8a0c1d22',
      regionCode: '3170011',
      regionName: '광화문',
      summary: '오피스 공실이 선행되며 1층 상권 도미노 침체 → 2022년 일부 회복',
      description:
        '오피스 공실률 상승이 먼저 나타난 뒤 1층 소매 상권이 연쇄적으로 침체한 사례입니다. 재택근무 확산으로 주간 유동인구가 줄며 요식업 매출이 급감했지만, 정부 투자와 재개발이 진행되며 2022년부터 일부 회복세로 전환됐습니다.',
      tag1: '종로구',
      tag2: '정부 투자',
      tag3: '재개발',
      tag4: '침체 후 회복',
      period: { startYear: 2018, endYear: 2020 },
    },
    {
      caseId: '3f2a8c1d-5b67-4e90-8a12-9c4d7e6f0b31',
      regionCode: '3170012',
      regionName: '경리단길',
      summary: '젠트리피케이션 이후 유동인구 급감으로 침체한 유사 사례',
      description:
        '임대료 급등으로 개성 있는 점포가 이탈하고, 대체 상권으로 수요가 분산되며 3년간 공실이 누적된 사례입니다. 상권 고유의 정체성이 약해지자 회복 동력도 함께 줄었습니다.',
      tag1: '용산구',
      tag2: '젠트리피케이션',
      tag3: '임대료 급등',
      period: { startYear: 2018, endYear: 2021 },
    },
    {
      caseId: 'b81d4c7e-2a95-4f36-8d10-6e2f9a3c5d48',
      regionCode: '3170013',
      regionName: '이태원',
      summary: '외국인 관광객 의존 상권이 외부 충격으로 급격히 위축',
      description:
        '관광객 비중이 높던 상권이 외부 충격으로 방문객이 끊기며 단기간에 폐업이 몰린 사례입니다. 이후 특색 있는 소규모 점포가 다시 모이며 완만하게 회복 중입니다.',
      tag1: '용산구',
      tag2: '관광 의존',
      tag3: '외부 충격',
      period: { startYear: 2020, endYear: 2022 },
    },
    {
      caseId: 'e4c92f0a-7d18-4b63-9a54-1c8e0d6b2f77',
      regionCode: '3170014',
      regionName: '삼청동',
      summary: '대형 프랜차이즈 진입 후 임대료 상승 → 소상공인 이탈',
      description:
        '프랜차이즈 진입으로 임대료가 오르자 기존 소상공인이 밀려나고 방문객의 발길도 줄어든 사례입니다. 한옥 상권 특성을 살린 콘텐츠가 재조명되며 최근 회복 조짐을 보입니다.',
      tag1: '종로구',
      tag2: '임대료 상승',
      tag3: '프랜차이즈',
      tag4: '회복 조짐',
      period: { startYear: 2016, endYear: 2019 },
    },
    {
      caseId: 'a25e8b3c-4f71-49d2-b680-3d9c1e7f4a06',
      regionCode: '3170015',
      regionName: '신촌',
      summary: '대학 상권 축소와 온라인 소비 전환으로 완만한 장기 침체',
      description:
        '비대면 수업과 온라인 소비 확산으로 대학가 유동인구가 구조적으로 줄어든 사례입니다. 회복 속도가 느려 업종 전환과 청년 창업 지원이 병행되고 있습니다.',
      tag1: '서대문구',
      tag2: '대학 상권',
      tag3: '온라인 전환',
      period: { startYear: 2019, endYear: 2023 },
    },
  ],
}

/** GET /api/v1/reportsHistory 데모 데이터 — 최신(2026Q2)부터 내림차순, 최신만 안 읽음 */
export const reportHistoryMock: ReportHistoryResponse = {
  totalCount: 6,
  hasNext: false,
  reports: [
    {
      reportId: 17,
      quarter: '2026Q2',
      grade: 'C',
      briefing: '상권 점수는 C등급이며,\n유동인구가 18% 감소했어요.',
      isRead: false,
    },
    {
      reportId: 12,
      quarter: '2026Q1',
      grade: 'B',
      briefing: '상권 점수는 B등급이며,\n유동인구가 1.4% 증가했어요.',
      isRead: true,
    },
    {
      reportId: 8,
      quarter: '2025Q4',
      grade: 'B',
      briefing: '상권 점수는 B등급이며,\n연말 특수로 유동인구가 일시 회복했어요.',
      isRead: true,
    },
    {
      reportId: 5,
      quarter: '2025Q3',
      grade: 'A',
      briefing: '상권 점수는 A등급이며,\n상권 활력이 높게 유지되고 있어요.',
      isRead: true,
    },
    {
      reportId: 3,
      quarter: '2025Q2',
      grade: 'A',
      briefing: '상권 점수는 A등급이며,\n신규 점포 유입이 이어지고 있어요.',
      isRead: true,
    },
    {
      reportId: 1,
      quarter: '2025Q1',
      grade: 'B',
      briefing: '상권 점수는 B등급이며,\n유동인구가 완만하게 증가했어요.',
      isRead: true,
    },
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
