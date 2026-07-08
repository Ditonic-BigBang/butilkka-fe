import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/api/mocks/server'
import type { MyStore } from '@/entities/store'
import MyStoreEditPage from './MyStoreEditPage'

const API = import.meta.env.VITE_API_BASE_URL ?? ''

function ok<T>(message: string, data: T) {
  return HttpResponse.json({ code: 200, status: 'OK', message, data })
}

const store: MyStore = {
  storeId: 1,
  storeName: '가게 A',
  address: '서울 중구 명동10길 52',
  storeOpenDate: '2022-08-15',
  regionCode: '3110001',
  regionName: '가로수길',
  categoryCode: 'CS100006',
  categoryName: '커피전문점',
  lat: 37.5636,
  lng: 126.9869,
  isPrimary: true,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/my/store/1/edit']}>
        <Routes>
          <Route path="/my/store/:storeId/edit" element={<MyStoreEditPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyStoreEditPage', () => {
  it('기존 가게 값으로 필드를 채운다', async () => {
    server.use(http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', [store])))
    renderPage()

    // 이름·주소·창업일 프리필
    expect(await screen.findByDisplayValue('가게 A')).toBeInTheDocument()
    expect(screen.getByText('서울 중구 명동10길 52')).toBeInTheDocument()
    expect(screen.getByText('2022.08.15')).toBeInTheDocument()
  })

  it('이름을 수정하고 저장하면 변경 필드로 PATCH 를 보낸다', async () => {
    let patched: Record<string, unknown> | null = null
    server.use(
      http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', [store])),
      http.patch(`${API}/api/v1/users/me/stores/:storeId`, async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>
        return ok('수정', { ...store, storeName: patched.storeName })
      }),
    )
    renderPage()

    const nameInput = await screen.findByDisplayValue('가게 A')
    fireEvent.change(nameInput, { target: { value: '새 가게 이름' } })
    fireEvent.click(screen.getByRole('button', { name: '주소 등록하기' }))

    await waitFor(() => expect(patched).not.toBeNull())
    expect(patched).toMatchObject({
      storeName: '새 가게 이름',
      storeOpenDate: '2022-08-15',
      address: '서울 중구 명동10길 52',
      regionCode: '3110001',
    })
  })

  it('가게를 못 찾으면 안내를 보여준다', async () => {
    server.use(http.get(`${API}/api/v1/users/me/stores`, () => ok('목록', [])))
    renderPage()
    expect(await screen.findByText('가게를 찾을 수 없어요')).toBeInTheDocument()
  })
})
