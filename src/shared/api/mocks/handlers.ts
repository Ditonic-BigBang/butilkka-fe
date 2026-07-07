import { http, HttpResponse } from 'msw'
import { dashboardMock, makeNotificationsMock } from './fixtures'

// MSW v2 요청 핸들러 — browser worker(개발)와 node server(테스트)가 공유한다.
// API 가 생길 때마다 여기에 기능별로 추가한다. 응답 형식은 API명세서 V3 의
// envelope({ code, status, message, data })를 따른다.
//
// 주의: public/seoul.geojson 은 실제 정적 에셋이므로 절대 mock 하지 않는다(passthrough).

// 백엔드 베이스 URL. 미설정이면 상대경로('/api/...')로 매칭한다.
const API = import.meta.env.VITE_API_BASE_URL ?? ''

/** envelope 성공 응답 */
function ok<T>(message: string, data: T) {
  return HttpResponse.json({ code: 200, status: 'OK', message, data })
}

// 서버 데이터 시뮬레이션 픽스처 — shared 는 상위 레이어(entities)를 import 하지 않는다(FSD).
// 백엔드 시드(V17, 요식업 CS1xxxxx)와 동일한 코드·표기. 실서버는 서비스·소매 업종도 반환한다.
const MOCK_CATEGORIES = [
  { categoryCode: 'CS100001', categoryName: '한식음식점' },
  { categoryCode: 'CS100002', categoryName: '중식음식점' },
  { categoryCode: 'CS100003', categoryName: '일식음식점' },
  { categoryCode: 'CS100004', categoryName: '양식음식점' },
  { categoryCode: 'CS100005', categoryName: '제과점' },
  { categoryCode: 'CS100006', categoryName: '커피전문점' },
  { categoryCode: 'CS100007', categoryName: '치킨전문점' },
  { categoryCode: 'CS100008', categoryName: '분식전문점' },
  { categoryCode: 'CS100009', categoryName: '호프/간이주점' },
  { categoryCode: 'CS100010', categoryName: '패스트푸드점' },
]

// 온보딩 완료(PUT store) 시 true — /me 의 isOnboarded 에 반영 (페이지 새로고침까지 유지)
let mockOnboarded = false

// 알림 목록 — 세션 동안 상태 유지(읽음 처리가 새로고침 전까지 반영되도록). 모듈 로드 시 1회 생성.
const notificationState = makeNotificationsMock()

export const handlers = [
  // 예시 핸들러 — 실제 엔드포인트가 생기면 교체/삭제할 것.
  http.get(`${API}/api/health`, () => HttpResponse.json({ status: 'ok' })),

  // ── 세션 ──────────────────────────────────────────────
  // 세션 목 — 실서버 UserResponse 와 동일한 envelope 형식. (브라우저에선 MSW off,
  // 테스트(node server)에서 사용. 비로그인 테스트는 403 으로 오버라이드.)
  http.get(`${API}/api/v1/users/me`, () =>
    ok('사용자 정보 조회 성공', {
      id: 1,
      name: '테스트유저',
      isOnboarded: mockOnboarded,
      store: null,
    }),
  ),
  http.post(`${API}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  // ── 온보딩 (API명세서 V3 — 서버 미반영이라 목으로 선연동) ──
  // 업종 목록 조회
  http.get(`${API}/api/v1/categories`, () => ok('업종 목록 조회 성공', MOCK_CATEGORIES)),

  // 좌표/주소 → 상권코드 매핑 — 데모용 고정 상권(명세 예시) 1건 반환
  http.get(`${API}/api/v1/regions/lookup`, ({ request }) => {
    const params = new URL(request.url).searchParams
    if (!params.has('keyword') && !(params.has('lat') && params.has('lng'))) {
      return HttpResponse.json(
        {
          code: 400,
          status: 'BAD_REQUEST',
          message: 'keyword 또는 lat/lng 가 필요합니다.',
          data: null,
        },
        { status: 400 },
      )
    }
    return ok('상권 조회 성공', [
      {
        regionCode: '3110001',
        regionName: '가로수길',
        address: '서울 강남구 신사동',
        lat: Number(params.get('lat') ?? 37.5203),
        lng: Number(params.get('lng') ?? 127.0229),
      },
    ])
  }),

  // 가게 위치·업종 설정/수정 (온보딩 완료 저장)
  http.put(`${API}/api/v1/users/me/store`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    mockOnboarded = true
    return ok('가게 정보 저장 성공', {
      ...body,
      regionName: '가로수길',
      categoryName: MOCK_CATEGORIES.find((c) => c.categoryCode === body.categoryCode)?.categoryName,
    })
  }),

  // ── 홈 (API명세서 V3 — 서버 미반영이라 목으로 선연동) ──
  // 홈 대시보드 (내 가게 기준 상권 등급·브리핑·지표)
  http.get(`${API}/api/v1/dashboard`, () => ok('대시보드 조회 성공', dashboardMock)),

  // ── 알림 (API명세서 V3 — 서버 미반영이라 목으로 선연동) ──
  // 받은 알림 목록 (offset/limit 은 데모에선 무시하고 전체 반환)
  http.get(`${API}/api/v1/notifications`, () => ok('알림 목록 조회 성공', notificationState)),

  // 알림 읽음 처리 — 상태를 갱신해 재조회 시 유지
  http.patch(`${API}/api/v1/notifications/:notificationId`, ({ params }) => {
    const id = Number(params.notificationId)
    const target = notificationState.notifications.find((n) => n.notificationId === id)
    if (!target) {
      return HttpResponse.json(
        { code: 404, status: 'NOT_FOUND', message: '존재하지 않는 알림입니다.', data: null },
        { status: 404 },
      )
    }
    target.isRead = true
    return ok('알림 읽음 처리 성공', { notificationId: id, isRead: true })
  }),
]
