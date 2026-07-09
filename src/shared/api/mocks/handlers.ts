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

// 내 가게 목록 — 온보딩 완료(PUT store) 시 대표 가게로 저장.
// 백엔드 store 테이블 분리 예정(유저당 여러 가게 + 대표 지정)이라 목록·isPrimary 선규격.
let mockStores: {
  storeId: number
  storeName: string
  address?: string
  storeOpenDate?: string
  regionCode: string
  regionName?: string
  categoryCode: string
  categoryName?: string
  lat: number
  lng: number
  isPrimary: boolean
}[] = []

// 알림 설정 — 세션 동안 유지. 초깃값은 Figma 마이페이지 기본 상태(연동·리포트 ON, 비상 OFF).
const mockNotificationSettings = { smsAlert: true, autoReport: true, urgentAlert: false }

// 리포트 PRO 구독 여부 — 데모용(구독 API 미정). false면 마이페이지에 업그레이드 카드가 뜬다.
const mockReportPro = false

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
      isReportPro: mockReportPro,
      // /me 의 store 요약은 대표 가게 기준
      store: mockStores.find((s) => s.isPrimary) ?? null,
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
    const categoryName = MOCK_CATEGORIES.find(
      (c) => c.categoryCode === body.categoryCode,
    )?.categoryName
    // 온보딩은 대표 가게 1개 등록 — 목록을 통째로 교체한다.
    mockStores = [
      {
        storeId: 1,
        storeName: typeof body.storeName === 'string' ? body.storeName : '내 가게',
        // 온보딩에서 선택한 도로명 주소를 그대로 저장(실서버 store.address 와 동일 계약)
        address: typeof body.address === 'string' ? body.address : undefined,
        storeOpenDate: typeof body.storeOpenDate === 'string' ? body.storeOpenDate : undefined,
        regionCode: String(body.regionCode ?? ''),
        regionName: '가로수길',
        categoryCode: String(body.categoryCode ?? ''),
        categoryName,
        lat: Number(body.lat ?? 0),
        lng: Number(body.lng ?? 0),
        isPrimary: true,
      },
    ]
    return ok('가게 정보 저장 성공', { ...body, regionName: '가로수길', categoryName })
  }),

  // 내 가게 목록 조회 (다점포·대표가게 — 백엔드 스펙 확정 전 선규격)
  http.get(`${API}/api/v1/users/me/stores`, () => ok('내 가게 목록 조회 성공', mockStores)),

  // 가게 추가 — 목록 맨 뒤에 append(대표 아님). 업종 입력이 없어 categoryCode 는 비워둔다.
  http.post(`${API}/api/v1/users/me/stores`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const nextId = mockStores.reduce((max, s) => Math.max(max, s.storeId), 0) + 1
    const categoryCode = String(body.categoryCode ?? '')
    const store = {
      storeId: nextId,
      storeName: typeof body.storeName === 'string' ? body.storeName : '내 가게',
      address: typeof body.address === 'string' ? body.address : undefined,
      storeOpenDate: typeof body.storeOpenDate === 'string' ? body.storeOpenDate : undefined,
      regionCode: String(body.regionCode ?? ''),
      regionName: '가로수길', // 목: 실서버는 regionCode 로 조회해 채운다
      categoryCode,
      categoryName: MOCK_CATEGORIES.find((c) => c.categoryCode === categoryCode)?.categoryName,
      lat: Number(body.lat ?? 0),
      lng: Number(body.lng ?? 0),
      isPrimary: false,
    }
    mockStores.push(store)
    return ok('가게 추가 성공', store)
  }),

  // 가게 수정/대표 지정 — isPrimary: true 부분 전송이면 기존 대표를 해제하고 교체
  http.patch(`${API}/api/v1/users/me/stores/:storeId`, async ({ params, request }) => {
    const id = Number(params.storeId)
    const target = mockStores.find((s) => s.storeId === id)
    if (!target) {
      return HttpResponse.json(
        { code: 404, status: 'NOT_FOUND', message: '존재하지 않는 가게입니다.', data: null },
        { status: 404 },
      )
    }
    const { isPrimary, ...rest } = (await request.json()) as Record<string, unknown>
    // isPrimary: true 면 기존 대표를 해제하고 이 가게로 교체
    if (isPrimary === true) {
      for (const s of mockStores) s.isPrimary = s.storeId === id
    }
    // 나머지 필드(이름·주소·창업일·좌표 등)는 부분 갱신
    Object.assign(target, rest)
    return ok('가게 정보 수정 성공', target)
  }),

  // ── 마이페이지 (API명세서 V3 — 서버 미반영이라 목으로 선연동) ──
  // 알림 설정 조회
  http.get(`${API}/api/v1/users/me/notification-settings`, () =>
    ok('알림 설정 조회 성공', mockNotificationSettings),
  ),

  // 알림 설정 변경 — 부분 갱신 후 전체 반환 (세션 동안 유지)
  http.patch(`${API}/api/v1/users/me/notification-settings`, async ({ request }) => {
    const patch = (await request.json()) as Partial<typeof mockNotificationSettings>
    Object.assign(mockNotificationSettings, patch)
    return ok('알림 설정 변경 성공', mockNotificationSettings)
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
