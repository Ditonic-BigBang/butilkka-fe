import { describe, it, expect } from 'vitest'
import { getCurrentUser } from '@/shared/api/api'
import { putMyStore, createStore, getMyStores } from './storeApi'

// 실제 MSW handlers(오버라이드 없이)를 타는 통합 테스트 — PUT 저장 → GET 조회 파이프라인.
describe('putMyStore — 저장한 주소 반영', () => {
  it('전송한 도로명 주소가 목록·세션 store 요약에 그대로 저장된다', async () => {
    await putMyStore({
      regionCode: '3110001',
      categoryCode: 'CS100006',
      lat: 37.5636,
      lng: 126.9857,
      storeName: '명동 쌀국수',
      storeOpenDate: '2022-08-15',
      storeAddress: '서울 중구 명동10길 52',
    })

    // 내 가게 목록 — 하드코딩(강남 신사동) 아닌 전송값이 저장돼야 한다
    const stores = await getMyStores()
    expect(stores[0]?.address).toBe('서울 중구 명동10길 52')
    expect(stores[0]?.storeName).toBe('명동 쌀국수')

    // /users/me 의 대표 가게 요약(마이페이지 카드가 읽는 값)에도 반영
    const user = await getCurrentUser()
    expect(user?.store?.address).toBe('서울 중구 명동10길 52')
  })
})

describe('createStore — 새 가게 추가', () => {
  it('목록 맨 뒤에 비대표 가게로 추가되고 대표는 유지된다', async () => {
    // 대표 가게 1개로 초기화(온보딩 저장) 후 신규 추가
    await putMyStore({
      regionCode: '3110001',
      categoryCode: 'CS100006',
      lat: 37.5,
      lng: 127,
      storeName: '대표 가게',
      storeOpenDate: '2020-01-01',
      storeAddress: '서울 강남구 신사동',
    })
    await createStore({
      regionCode: '3110001',
      categoryCode: 'CS100006',
      lat: 37.5636,
      lng: 126.9857,
      storeName: '명동 신규점',
      storeOpenDate: '2023-05-05',
      storeAddress: '서울 중구 명동10길 52',
    })

    const stores = await getMyStores()
    // 맨 뒤에 추가
    expect(stores.at(-1)?.storeName).toBe('명동 신규점')
    const added = stores.find((s) => s.storeName === '명동 신규점')
    expect(added?.isPrimary).toBe(false)
    expect(added?.address).toBe('서울 중구 명동10길 52')
    // 기존 대표 가게는 그대로 대표
    expect(stores.find((s) => s.storeName === '대표 가게')?.isPrimary).toBe(true)
  })
})
