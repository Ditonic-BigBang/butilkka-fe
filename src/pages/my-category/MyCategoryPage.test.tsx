import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/api/mocks/server'
import type { MyStore } from '@/entities/store'
import MyCategoryPage from './MyCategoryPage'

const API = import.meta.env.VITE_API_BASE_URL ?? ''

function ok<T>(message: string, data: T) {
  return HttpResponse.json({ code: 200, status: 'OK', message, data })
}

const primary: MyStore = {
  storeId: 1,
  storeName: '내 가게',
  address: '서울 중구 명동10길 52',
  storeOpenDate: '2022-08-12',
  regionCode: '3110001',
  regionName: '가로수길',
  categoryCode: 'CS100006',
  categoryName: '커피전문점',
  lat: 37.5203,
  lng: 127.0229,
  isPrimary: true,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/my/category']}>
        <Routes>
          <Route path="/my/category" element={<MyCategoryPage />} />
          <Route path="/my" element={<div>마이페이지 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyCategoryPage', () => {
  it('현재 업종을 보여주고, 미선택 상태에선 CTA 가 비활성이다', async () => {
    server.use(http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', [primary])))
    renderPage()

    // 현재 업종 박스 안 칩에 대표 가게 업종이 표시된다
    // (그리드에도 같은 이름의 항목이 있으므로 "현재 업종" 박스로 스코프해 구분)
    const box = (await screen.findByText('현재 업종')).parentElement as HTMLElement
    expect(within(box).getByText('커피전문점')).toBeInTheDocument()
    // 미선택 → "다음" 비활성
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('업종을 골라 "다음" 을 누르면 PATCH 후 마이페이지로 이동한다', async () => {
    let patched: Record<string, unknown> | null = null
    server.use(
      http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', [primary])),
      http.patch(`${API}/api/v1/users/me/stores/:storeId`, async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>
        return ok('수정', { ...primary, categoryCode: patched.categoryCode })
      }),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '한식음식점' }))
    const cta = screen.getByRole('button', { name: '다음' })
    expect(cta).toBeEnabled()
    fireEvent.click(cta)

    // 마이페이지로 이동
    expect(await screen.findByText('마이페이지 화면')).toBeInTheDocument()
    // 선택한 업종으로 PATCH
    await waitFor(() => expect(patched).toMatchObject({ categoryCode: 'CS100001' }))
  })
})
