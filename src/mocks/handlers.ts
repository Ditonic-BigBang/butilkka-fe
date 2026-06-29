import { http, HttpResponse } from 'msw'

// MSW v2 요청 핸들러 — browser worker(개발)와 node server(테스트)가 공유한다.
// API 가 생길 때마다 여기에 기능별로 추가한다.
//
// 주의: public/seoul.geojson 은 실제 정적 에셋이므로 절대 mock 하지 않는다(passthrough).

// 백엔드 베이스 URL. 미설정이면 상대경로('/api/...')로 매칭한다.
const API = import.meta.env.VITE_API_BASE_URL ?? ''

export const handlers = [
  // 예시 핸들러 — 실제 엔드포인트가 생기면 교체/삭제할 것.
  http.get(`${API}/api/health`, () => HttpResponse.json({ status: 'ok' })),
]
