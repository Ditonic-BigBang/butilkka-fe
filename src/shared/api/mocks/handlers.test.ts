import { describe, expect, it } from 'vitest'

// 핸들러는 VITE_API_BASE_URL 기준 절대 URL 로 등록된다 — 요청도 같은 베이스로
const API = import.meta.env.VITE_API_BASE_URL ?? ''

// MSW 데모 계약 — 온보딩에서 저장한 가게가 대시보드·리포트 목에 반영된다
// (실서버가 내 가게 기준으로 내려주는 동작을 목이 흉내내는지 검증).
// 핸들러는 node 테스트 서버(src/test/setup.ts)가 구동한다.
describe('온보딩 저장 가게 반영', () => {
  it('가게 저장(PUT) 후 대시보드·리포트 헤더가 입력 주소의 자치구를 따른다', async () => {
    const put = await fetch(`${API}/api/v1/users/me/store`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeName: '민수네 국밥',
        address: '서울 마포구 월드컵로 123',
        regionCode: '3110021',
        categoryCode: 'CS100003',
        lat: 37.556,
        lng: 126.91,
      }),
    })
    expect(put.ok).toBe(true)

    // 홈 헤더 = dashboard.store.district + regionName
    const dashboard = (await (await fetch(`${API}/api/v1/dashboard`)).json()).data
    expect(dashboard.store.district).toBe('마포구')
    expect(dashboard.store.regionName).toBe('가로수길')

    // 리포트 헤더 = regionName · categoryName (업종도 입력값 반영)
    const report = (await (await fetch(`${API}/api/v1/reports/latest`)).json()).data
    expect(report.districtName).toBe('마포구')
    expect(report.categoryName).toBe('일식음식점')
  })
})
