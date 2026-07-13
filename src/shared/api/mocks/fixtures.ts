// MSW 핸들러·Storybook 스토리가 공유하는 목 픽스처 — API명세서 V3 응답(data) 형태.
// MSW/Storybook 전용 fixture 는 앱 계층과 분리되어 있어 도메인 DTO 타입을 직접 참조한다.
import type {
  ReportCasesResponse,
  ReportGrade,
  ReportHistoryItem,
  ReportHistoryResponse,
  ReportRecommendation,
  ReportResponse,
} from '@/entities/report'
import type { DashboardResponse } from '@/entities/dashboard'
import type { NotificationListResponse } from '@/entities/notification'
import type {
  MetricKey,
  RankingOrder,
  RegionDetailResponse,
  RegionDirection,
  RegionGrade,
  RegionMapItem,
  RegionMapResponse,
  RegionMetricMapResponse,
  RegionMetricRankingResponse,
  RegionRankingResponse,
} from '@/entities/region'

/** GET /api/v1/dashboard 데모 데이터 (명세 예시 기반) */
export const dashboardMock: DashboardResponse = {
  store: {
    regionCode: '3110001',
    regionName: '가로수길',
    categoryName: '한식음식점',
    // regions/lookup 목 주소와 일치 — 홈 위치 pill 폴백이 "서울" 접두를 떼고 표시
    address: '서울 강남구 신사동',
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
    districtName: '강남구',
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

// ── 지도/상권 ────────────────────────────────────────────────

/**
 * GET /api/v1/regions/map 데모 데이터 — 상권 단위 쇠퇴등급.
 * 서대문구는 상권 2개(C·E)로 구 단위 마커의 최악 등급 대표 로직을 태운다.
 * 등급 분포는 declineRankingMock(top: 서대문E→광진E→노원D→용산D→강서C)과 일치.
 */
export const regionMapMock: RegionMapResponse = {
  quarter: '2025Q4',
  regions: [
    { regionCode: '3110001', regionName: '신촌', district: '서대문구', grade: 'C' },
    { regionCode: '3110002', regionName: '이대역', district: '서대문구', grade: 'E' },
    { regionCode: '3110003', regionName: '건대입구', district: '광진구', grade: 'E' },
    { regionCode: '3110004', regionName: '노원역', district: '노원구', grade: 'D' },
    { regionCode: '3110005', regionName: '이태원', district: '용산구', grade: 'D' },
    { regionCode: '3110006', regionName: '화곡역', district: '강서구', grade: 'C' },
    { regionCode: '3110007', regionName: '홍대입구', district: '마포구', grade: 'B' },
    { regionCode: '3110008', regionName: '가로수길', district: '강남구', grade: 'A' },
    { regionCode: '3110009', regionName: '명동', district: '중구', grade: 'B' },
    { regionCode: '3110010', regionName: '종로3가', district: '종로구', grade: 'B' },
    { regionCode: '3110011', regionName: '서울대입구', district: '관악구', grade: 'C' },
    { regionCode: '3110012', regionName: '왕십리', district: '성동구', grade: 'B' },
    { regionCode: '3110013', regionName: '잠실', district: '송파구', grade: 'A' },
    { regionCode: '3110014', regionName: '서초역', district: '서초구', grade: 'A' },
  ],
}

/** GET /api/v1/regions/declineRanking 최신 분기 기준 데이터 — 디자인(지도 홈) Top5 와 동일 */
const declineRankingMock: Record<RankingOrder, RegionRankingResponse> = {
  top: {
    order: 'top',
    quarter: '2025Q4',
    regions: [
      {
        rank: 1,
        regionCode: '3110002',
        regionName: '서울 서대문구',
        decline_grade: 'E',
        direction: 'UP',
      },
      {
        rank: 2,
        regionCode: '3110003',
        regionName: '서울 광진구',
        decline_grade: 'E',
        direction: 'DOWN',
      },
      {
        rank: 3,
        regionCode: '3110004',
        regionName: '서울 노원구',
        decline_grade: 'D',
        direction: 'UP',
      },
      {
        rank: 4,
        regionCode: '3110005',
        regionName: '서울 용산구',
        decline_grade: 'D',
        direction: 'FLAT',
      },
      {
        rank: 5,
        regionCode: '3110006',
        regionName: '서울 강서구',
        decline_grade: 'C',
        direction: 'DOWN',
      },
    ],
  },
  bottom: {
    order: 'bottom',
    quarter: '2025Q4',
    regions: [
      {
        rank: 1,
        regionCode: '3110008',
        regionName: '서울 강남구',
        decline_grade: 'A',
        direction: 'FLAT',
      },
      {
        rank: 2,
        regionCode: '3110013',
        regionName: '서울 송파구',
        decline_grade: 'A',
        direction: 'UP',
      },
      {
        rank: 3,
        regionCode: '3110014',
        regionName: '서울 서초구',
        decline_grade: 'A',
        direction: 'FLAT',
      },
      {
        rank: 4,
        regionCode: '3110007',
        regionName: '서울 마포구',
        decline_grade: 'B',
        direction: 'DOWN',
      },
      {
        rank: 5,
        regionCode: '3110009',
        regionName: '서울 중구',
        decline_grade: 'B',
        direction: 'UP',
      },
    ],
  },
}

type MetricSeed = { value: number; direction: RegionDirection }

/**
 * 상권별 지표 값 시드 — 지표 카테고리(metricMap·metricRanking·상세 요약)가 모두 이 테이블에서
 * 파생돼 마커·랭킹·구 선택 상세 값이 서로 일치한다. 여기 등록된 지표만 카테고리로 동작(나머지 400).
 * 구 대표(최댓값) 기준 상위 5위가 디자인 Top5 순서(서대문 > 광진 > 노원 > 용산 > 강서)가 되게 배치.
 */
const METRIC_SEEDS: Partial<Record<MetricKey, Record<string, MetricSeed>>> = {
  // 매출 대비 임대료(원) — 서대문구 대표 789만원
  rentRatio: {
    '3110001': { value: 6_120_000, direction: 'DOWN' }, // 신촌
    '3110002': { value: 7_890_000, direction: 'UP' }, // 이대역 → 서대문구 대표
    '3110003': { value: 7_420_000, direction: 'DOWN' }, // 건대입구(광진구)
    '3110004': { value: 7_180_000, direction: 'UP' }, // 노원역
    '3110005': { value: 6_950_000, direction: 'FLAT' }, // 이태원(용산구)
    '3110006': { value: 6_600_000, direction: 'DOWN' }, // 화곡역(강서구)
    '3110007': { value: 4_310_000, direction: 'DOWN' }, // 홍대입구(마포구)
    '3110008': { value: 3_950_000, direction: 'FLAT' }, // 가로수길(강남구)
    '3110009': { value: 4_480_000, direction: 'UP' }, // 명동(중구)
    '3110010': { value: 5_240_000, direction: 'UP' }, // 종로3가
    '3110011': { value: 5_760_000, direction: 'UP' }, // 서울대입구(관악구)
    '3110012': { value: 5_020_000, direction: 'DOWN' }, // 왕십리(성동구)
    '3110013': { value: 3_620_000, direction: 'UP' }, // 잠실(송파구)
    '3110014': { value: 3_140_000, direction: 'FLAT' }, // 서초역
  },
  // 유동인구(명) — 서대문구 대표 134,302명
  footTraffic: {
    '3110001': { value: 121_940, direction: 'DOWN' }, // 신촌
    '3110002': { value: 134_302, direction: 'UP' }, // 이대역 → 서대문구 대표
    '3110003': { value: 128_450, direction: 'DOWN' }, // 건대입구(광진구)
    '3110004': { value: 122_780, direction: 'UP' }, // 노원역
    '3110005': { value: 118_630, direction: 'FLAT' }, // 이태원(용산구)
    '3110006': { value: 112_940, direction: 'DOWN' }, // 화곡역(강서구)
    '3110007': { value: 96_210, direction: 'DOWN' }, // 홍대입구(마포구)
    '3110008': { value: 74_380, direction: 'FLAT' }, // 가로수길(강남구)
    '3110009': { value: 81_020, direction: 'UP' }, // 명동(중구)
    '3110010': { value: 88_760, direction: 'UP' }, // 종로3가
    '3110011': { value: 102_540, direction: 'UP' }, // 서울대입구(관악구)
    '3110012': { value: 91_830, direction: 'DOWN' }, // 왕십리(성동구)
    '3110013': { value: 78_150, direction: 'UP' }, // 잠실(송파구)
    '3110014': { value: 68_930, direction: 'FLAT' }, // 서초역
  },
  // 공실률(%) — 서대문구 대표 13%
  vacancyRate: {
    '3110001': { value: 12.4, direction: 'DOWN' }, // 신촌
    '3110002': { value: 13, direction: 'UP' }, // 이대역 → 서대문구 대표
    '3110003': { value: 12.7, direction: 'DOWN' }, // 건대입구(광진구)
    '3110004': { value: 12.2, direction: 'UP' }, // 노원역
    '3110005': { value: 11.8, direction: 'FLAT' }, // 이태원(용산구)
    '3110006': { value: 11.3, direction: 'DOWN' }, // 화곡역(강서구)
    '3110007': { value: 8.9, direction: 'DOWN' }, // 홍대입구(마포구)
    '3110008': { value: 6.4, direction: 'FLAT' }, // 가로수길(강남구)
    '3110009': { value: 7.2, direction: 'UP' }, // 명동(중구)
    '3110010': { value: 8.1, direction: 'UP' }, // 종로3가
    '3110011': { value: 9.6, direction: 'UP' }, // 서울대입구(관악구)
    '3110012': { value: 8.5, direction: 'DOWN' }, // 왕십리(성동구)
    '3110013': { value: 6.8, direction: 'UP' }, // 잠실(송파구)
    '3110014': { value: 5.9, direction: 'FLAT' }, // 서초역
  },
  // 폐업률(%) — 서대문구 대표 4.9%
  closureRate: {
    '3110001': { value: 4.6, direction: 'UP' }, // 신촌
    '3110002': { value: 4.9, direction: 'UP' }, // 이대역 → 서대문구 대표
    '3110003': { value: 4.7, direction: 'DOWN' }, // 건대입구(광진구)
    '3110004': { value: 4.4, direction: 'UP' }, // 노원역
    '3110005': { value: 4.2, direction: 'FLAT' }, // 이태원(용산구)
    '3110006': { value: 3.9, direction: 'DOWN' }, // 화곡역(강서구)
    '3110007': { value: 3.1, direction: 'DOWN' }, // 홍대입구(마포구)
    '3110008': { value: 2.3, direction: 'FLAT' }, // 가로수길(강남구)
    '3110009': { value: 2.6, direction: 'UP' }, // 명동(중구)
    '3110010': { value: 2.9, direction: 'UP' }, // 종로3가
    '3110011': { value: 3.4, direction: 'UP' }, // 서울대입구(관악구)
    '3110012': { value: 2.7, direction: 'DOWN' }, // 왕십리(성동구)
    '3110013': { value: 2.4, direction: 'UP' }, // 잠실(송파구)
    '3110014': { value: 2.1, direction: 'FLAT' }, // 서초역
  },
  // 점포수(개) — 서대문구 대표 567개
  storeCount: {
    '3110001': { value: 521, direction: 'DOWN' }, // 신촌
    '3110002': { value: 567, direction: 'UP' }, // 이대역 → 서대문구 대표
    '3110003': { value: 552, direction: 'DOWN' }, // 건대입구(광진구)
    '3110004': { value: 538, direction: 'UP' }, // 노원역
    '3110005': { value: 512, direction: 'FLAT' }, // 이태원(용산구)
    '3110006': { value: 498, direction: 'DOWN' }, // 화곡역(강서구)
    '3110007': { value: 431, direction: 'DOWN' }, // 홍대입구(마포구)
    '3110008': { value: 289, direction: 'FLAT' }, // 가로수길(강남구)
    '3110009': { value: 342, direction: 'UP' }, // 명동(중구)
    '3110010': { value: 405, direction: 'UP' }, // 종로3가
    '3110011': { value: 463, direction: 'UP' }, // 서울대입구(관악구)
    '3110012': { value: 377, direction: 'DOWN' }, // 왕십리(성동구)
    '3110013': { value: 318, direction: 'UP' }, // 잠실(송파구)
    '3110014': { value: 265, direction: 'FLAT' }, // 서초역
  },
}

// 시드 미등록 상권 폴백 값 (regionMapMock 에 상권을 추가해도 목이 깨지지 않게)
const METRIC_SEED_FALLBACK: Record<string, MetricSeed> = {
  rentRatio: { value: 5_000_000, direction: 'UP' },
  footTraffic: { value: 100_000, direction: 'UP' },
  vacancyRate: { value: 8, direction: 'UP' },
  closureRate: { value: 3, direction: 'UP' },
  storeCount: { value: 400, direction: 'UP' },
}

/** 서울 전체 평균 영업 기간(년) — 폐업률 랭킹 하단·상세 비교 기준 (디자인 5.9년) */
const SEOUL_AVG_OPERATING_YEARS = 5.9

function metricSeed(metric: MetricKey, regionCode: string): MetricSeed {
  return (
    METRIC_SEEDS[metric]?.[regionCode] ??
    METRIC_SEED_FALLBACK[metric] ?? { value: 100, direction: 'FLAT' }
  )
}

// ── 분기 이동 — 목은 최신 분기(2025Q4) 값 기준, 과거 분기 요청 시 추이 패턴만큼 결정적으로 되돌린다 ──

const LATEST_QUARTER = '2025Q4'

function quarterIndex(quarter: string): number | null {
  const match = /^(\d{4})Q([1-4])$/.exec(quarter)
  if (!match) return null
  return Number(match[1]) * 4 + Number(match[2]) - 1
}

/** 요청 분기가 최신(2025Q4)보다 몇 분기 과거인지 — 미지정·형식 오류·미래는 0(최신) */
function quartersBack(quarter?: string | null): number {
  const index = quarter ? quarterIndex(quarter) : null
  if (index === null) return 0
  return Math.max(0, (quarterIndex(LATEST_QUARTER) as number) - index)
}

/** 응답에 실을 조회 분기 — 유효한 과거 분기만 그대로, 나머지는 최신 */
function anchorQuarter(quarter?: string | null): string {
  return quartersBack(quarter) > 0 ? (quarter as string) : LATEST_QUARTER
}

/** 기준 분기로 끝나는 count 개 분기 목록 (오름차순) */
function quartersEnding(quarter: string, count: number): string[] {
  const end = quarterIndex(quarter) ?? (quarterIndex(LATEST_QUARTER) as number)
  return Array.from({ length: count }, (_, i) => {
    const index = end - (count - 1 - i)
    return `${Math.floor(index / 4)}Q${(index % 4) + 1}`
  })
}

// 지표별 값 단위(반올림 스텝) — 추이·분기 이동 계산 공용
const METRIC_ROUND_TO: Record<MetricKey, number> = {
  rentRatio: 10_000,
  footTraffic: 10,
  vacancyRate: 0.1,
  closureRate: 0.1,
  storeCount: 1,
}

// direction 방향으로 분기당 값의 1.2%씩 변화 — k 분기 과거의 시드 값
function seedValueAt(seed: MetricSeed, roundTo: number, k: number): number {
  const sign = seed.direction === 'DOWN' ? -1 : seed.direction === 'UP' ? 1 : 0
  const step = Math.max(roundTo, Math.round((seed.value * 0.012) / roundTo) * roundTo)
  return Math.round((seed.value - sign * step * k) * 1000) / 1000
}

/**
 * 최신 분기 등급 기준 k 분기 전 등급 — 상세 추이 패턴(TREND_OFFSETS)과 같은 소스를 쓰므로
 * 지도 마커·랭킹·상세의 분기별 등급이 서로 일치한다.
 */
function gradeAtQuartersBack(latestGrade: RegionGrade, k: number): RegionGrade {
  const offset = k <= 11 ? TREND_OFFSETS[11 - k] : TREND_OFFSETS[0]
  const index = GRADE_ORDER.indexOf(latestGrade) + offset
  return GRADE_ORDER[Math.min(4, Math.max(0, index))]
}

/** GET /api/v1/regions/map 데모 데이터 — 분기별 등급 이동 반영 */
export function makeRegionMapMock(quarter?: string | null): RegionMapResponse {
  const back = quartersBack(quarter)
  return {
    quarter: anchorQuarter(quarter),
    regions: regionMapMock.regions.map((region) => ({
      regionCode: region.regionCode,
      regionName: region.regionName,
      district: region.district,
      grade: gradeAtQuartersBack(region.grade, back),
    })),
  }
}

/** GET /api/v1/regions/declineRanking 데모 데이터 — 분기별 등급 이동 반영 */
export function makeDeclineRankingMock(
  order: RankingOrder,
  quarter?: string | null,
): RegionRankingResponse {
  const base = declineRankingMock[order]
  const back = quartersBack(quarter)
  return {
    ...base,
    quarter: anchorQuarter(quarter),
    regions: base.regions.map((region) => ({
      rank: region.rank,
      regionCode: region.regionCode,
      regionName: region.regionName,
      decline_grade: gradeAtQuartersBack(region.decline_grade, back),
      direction: region.direction,
    })),
  }
}

const metricMapMocks = Object.fromEntries(
  Object.entries(METRIC_SEEDS).map(([metric, seeds]) => [
    metric,
    {
      metric: metric as MetricKey,
      quarter: '2025Q4',
      regions: regionMapMock.regions.map(({ regionCode, regionName, district }) => ({
        regionCode,
        regionName,
        district,
        value: seeds[regionCode]?.value ?? metricSeed(metric as MetricKey, regionCode).value,
      })),
    },
  ]),
) as Partial<Record<MetricKey, RegionMetricMapResponse>>

/**
 * GET /api/v1/regions/metricMap 데모 데이터 (선규격) — 지원 지표만 등록, 분기별 값 이동 반영.
 * 핸들러는 도메인 타입을 모른 채 문자열 metric 을 넘기고, 미지원이면 null(→400).
 */
export function getMetricMapMock(
  metric: string | null,
  quarter?: string | null,
): RegionMetricMapResponse | null {
  if (!metric) return null
  const base = metricMapMocks[metric as MetricKey]
  if (!base) return null
  const back = quartersBack(quarter)
  return {
    ...base,
    quarter: anchorQuarter(quarter),
    regions: base.regions.map((region) => ({
      regionCode: region.regionCode,
      regionName: region.regionName,
      district: region.district,
      value: seedValueAt(
        metricSeed(base.metric, region.regionCode),
        METRIC_ROUND_TO[base.metric],
        back,
      ),
    })),
  }
}

/**
 * GET /api/v1/regions/metricRanking 데모 데이터 (선규격) — metricMap 목에서 구 대표(최댓값)를
 * 뽑아 정렬한 Top5. 순위명은 declineRanking 과 같은 구 단위("서울 서대문구") 표기.
 */
export function makeMetricRankingMock(
  metric: string | null,
  order: RankingOrder,
  quarter?: string | null,
): RegionMetricRankingResponse | null {
  const map = getMetricMapMock(metric, quarter)
  if (!map) return null

  const topByDistrict = new Map<string, (typeof map.regions)[number]>()
  map.regions.forEach((region) => {
    const prev = topByDistrict.get(region.district)
    if (!prev || region.value > prev.value) topByDistrict.set(region.district, region)
  })

  const regions = [...topByDistrict.values()]
    .toSorted((a, b) => (order === 'top' ? b.value - a.value : a.value - b.value))
    .slice(0, 5)
    .map((region, i) => ({
      rank: i + 1,
      regionCode: region.regionCode,
      regionName: `서울 ${region.district}`,
      value: region.value,
      direction: metricSeed(map.metric, region.regionCode).direction,
    }))

  return {
    metric: map.metric,
    order,
    quarter: map.quarter,
    regions,
    // 폐업률만 랭킹 하단 "평균 영업 기간 — 서울 전체" 섹션용 값 포함
    ...(map.metric === 'closureRate' && { avgOperatingYears: SEOUL_AVG_OPERATING_YEARS }),
  }
}

const GRADE_ORDER: RegionGrade[] = ['A', 'B', 'C', 'D', 'E']
// 최신 등급으로 수렴하는 결정적 오프셋 패턴 (마지막 = 최신, 직전 = 한 단계 양호 → 지난 분기 pill)
const TREND_OFFSETS = [-2, -2, -1, -2, -1, -1, 0, -1, -1, 0, -1, 0]

// 추이 마지막 두 분기의 증감률(%) — 상세 changeRate 를 추이와 일치시키는 용도
function trendChangeRate(trend: { value: number }[]): number {
  const prev = trend[trend.length - 2].value
  const current = trend[trend.length - 1].value
  return Math.round((Math.abs(current - prev) / prev) * 1000) / 10
}

/**
 * GET /api/v1/districts/{regionCode} 데모 데이터 — 조회 분기 기준 12분기 추이를 만든다.
 * 등급·지표 값 모두 분기 이동 헬퍼(gradeAtQuartersBack·seedValueAt)에서 파생되어
 * 같은 분기의 지도 마커·랭킹 값과 항상 일치한다.
 */
export function makeRegionDetailMock(
  region: RegionMapItem,
  quarter?: string | null,
): RegionDetailResponse {
  const back = quartersBack(quarter)
  const quarters = quartersEnding(anchorQuarter(quarter), 12)
  const last = quarters.length - 1

  const gradeTrend = quarters.map((q, i) => ({
    quarter: q,
    grade: gradeAtQuartersBack(region.grade, back + (last - i)),
  }))

  // 지표 요약 — 조회 분기 값 + 그 분기로 끝나는 추이 (마커/랭킹 값과 일치)
  const summaryAt = (metric: MetricKey) => {
    const seed = metricSeed(metric, region.regionCode)
    const roundTo = METRIC_ROUND_TO[metric]
    const trend = quarters.map((q, i) => ({
      quarter: q,
      value: seedValueAt(seed, roundTo, back + (last - i)),
    }))
    return {
      value: seedValueAt(seed, roundTo, back),
      changeRate: trendChangeRate(trend),
      direction: seed.direction,
      trend,
    }
  }

  const closureSummary = summaryAt('closureRate')
  const storeSummary = summaryAt('storeCount')

  return {
    regionCode: region.regionCode,
    district: region.district,
    regionName: region.regionName,
    quarter: anchorQuarter(quarter),
    declineGrade: {
      current: gradeAtQuartersBack(region.grade, back),
      previous: gradeAtQuartersBack(region.grade, back + 1),
      trend: gradeTrend,
    },
    rentRatio: summaryAt('rentRatio'),
    footTraffic: summaryAt('footTraffic'),
    vacancyRate: summaryAt('vacancyRate'),
    closureRate: {
      ...closureSummary,
      // 폐업률이 높을수록 평균 영업 기간이 짧다 — 시드에서 결정적으로 파생
      avgOperatingYears: Math.round((8 - closureSummary.value) * 10) / 10,
      seoulAvgOperatingYears: SEOUL_AVG_OPERATING_YEARS,
    },
    storeCount: {
      value: storeSummary.value,
      changeCount: storeSummary.value - storeSummary.trend[last - 1].value,
      direction: storeSummary.direction,
      trend: storeSummary.trend,
      categoryDistribution: [
        { category: '한식음식점', count: 92 },
        { category: '커피-음료', count: 74 },
      ],
    },
  }
}
