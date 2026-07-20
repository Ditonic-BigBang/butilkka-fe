import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { storeKeys, type MyStore } from '@/entities/store'
import { GNB } from '@/widgets/mobile-layout'
import MyStoreEditPage, { EditSkeleton } from './MyStoreEditPage'

const storeMock: MyStore = {
  storeId: 1,
  storeName: '뽀짜이 베트남쌀국수 명동본점',
  address: '서울 중구 명동10길 52 신한익스페이스',
  storeOpenDate: '2022-08-15',
  regionCode: '3110001',
  regionName: '가로수길',
  categoryCode: 'CS100006',
  categoryName: '커피·음료',
  lat: 37.5636,
  lng: 126.9869,
  isPrimary: true,
}

// 스토리는 네트워크 없이 렌더 — 가게 목록을 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(storeKeys.myStores(), [storeMock])
  return queryClient
}

/**
 * 내 가게 수정 전체 화면. Figma: `[4-2] 가게위치 변경하기/3. 301:5536` ·
 * API: `PATCH /api/v1/users/me/stores/{id}`. (지도 프리뷰는 카카오 SDK 필요)
 */
const meta = {
  title: 'My/MyStoreEditPage',
  component: MyStoreEditPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={seededClient()}>
        <MemoryRouter initialEntries={['/my/store/1/edit']}>
          <Routes>
            <Route path="/my/store/:storeId/edit" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MyStoreEditPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 로딩 스켈레톤 — 가게 정보 응답 대기 (shimmer). GNB 는 로딩 중에도 실 UI 그대로 */
export const Skeleton: Story = {
  name: '로딩 스켈레톤',
  render: () => (
    <div className="flex min-h-screen flex-col bg-white">
      <GNB title="내 가게 설정" showSettings={false} />
      <EditSkeleton />
    </div>
  ),
}
