// MSW 핸들러·Storybook 스토리가 공유하는 목 픽스처 — API명세서 V3 응답(data) 형태.
// shared 는 상위 레이어를 import 하지 않으므로 DTO 타입은 같은 shared/api 에서 가져온다(FSD).
import type { DashboardResponse, NotificationListResponse } from '@/shared/api/types'

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
