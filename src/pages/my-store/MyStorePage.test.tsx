import { describe, it, expect } from 'vitest'
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/api/mocks/server'
import type { MyStore } from '@/entities/store'
import MyStorePage from './MyStorePage'

const API = import.meta.env.VITE_API_BASE_URL ?? ''

function ok<T>(message: string, data: T) {
  return HttpResponse.json({ code: 200, status: 'OK', message, data })
}

// 테스트마다 새로 만드는 상태 있는 목 — PATCH 가 대표를 갈아끼우는 서버 동작을 재현
function makeStores(): MyStore[] {
  const base = {
    address: '서울 중구 명동10길 52',
    storeOpenDate: '2022-08-15',
    regionCode: '3110001',
    regionName: '가로수길',
    categoryCode: 'CS100006',
    categoryName: '커피전문점',
    lat: 37.5203,
    lng: 127.0229,
  }
  return [
    { ...base, storeId: 1, storeName: '가게 A', isPrimary: true },
    { ...base, storeId: 2, storeName: '가게 B', isPrimary: false },
  ]
}

function renderPage(
  entries: Array<string | { pathname: string; state?: unknown }> = ['/my/store'],
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={entries}>
        <Routes>
          <Route path="/my/store" element={<MyStorePage />} />
          <Route path="/my" element={<div>마이페이지 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyStorePage', () => {
  it('가게 목록을 렌더링하고 대표 가게에만 칩을 표시한다', async () => {
    server.use(http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', makeStores())))
    renderPage()

    expect(await screen.findByText('가게 A')).toBeInTheDocument()
    expect(screen.getByText('가게 B')).toBeInTheDocument()
    expect(screen.getAllByText('현재 대표 위치')).toHaveLength(1)
  })

  it('일반 가게 행을 탭하면 대표로 지정(PATCH)하고 마이페이지로 이동한다', async () => {
    const stores = makeStores()
    let patchedId: number | null = null
    server.use(
      http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', stores)),
      http.patch(`${API}/api/v1/users/me/stores/:storeId`, ({ params }) => {
        patchedId = Number(params.storeId)
        for (const s of stores) s.isPrimary = s.storeId === patchedId
        return ok('수정', stores[1])
      }),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '가게 B' }, { timeout: 5000 }))

    await waitFor(() => expect(patchedId).toBe(2))
    expect(await screen.findByText('마이페이지 화면')).toBeInTheDocument()
  })

  it('신규 등록 직후(state.toast) 하단 토스트를 표시하고 2.5초 뒤 사라진다', async () => {
    server.use(http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', makeStores())))
    renderPage([{ pathname: '/my/store', state: { toast: '새로운 주소가 등록되었습니다.' } }])

    const toast = await screen.findByText('새로운 주소가 등록되었습니다.')
    expect(toast).toBeInTheDocument()

    // 2.5초 뒤 자동으로 사라진다 (state 소비로 effect 가 재실행돼도 타이머 유지)
    await waitForElementToBeRemoved(() => screen.queryByText('새로운 주소가 등록되었습니다.'), {
      timeout: 4000,
    })
  })

  it('대표 가게 행은 탭 대상이 아니다', async () => {
    server.use(http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', makeStores())))
    renderPage()

    const cardA = (await screen.findByText('가게 A')).closest('li')!
    // 대표 가게엔 본문 오버레이 버튼이 없고, 수정·삭제 버튼만 존재
    expect(within(cardA).queryByRole('button', { name: '가게 A' })).not.toBeInTheDocument()
    expect(within(cardA).getByRole('button', { name: '수정' })).toBeInTheDocument()
  })
})
