import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { storeKeys, type MyStore } from '@/entities/store'
import MyStorePage from './MyStorePage'

// Figma 예시처럼 대표 가게 1개 + 일반 가게 2개
const storesMock: MyStore[] = [1, 2, 3].map((id) => ({
  storeId: id,
  storeName: '뽀짜이 베트남쌀국수 명동본점',
  address: '서울 중구 명동10길 52 신한익스페이스',
  storeOpenDate: '2022-08-15',
  regionCode: '3110001',
  regionName: '가로수길',
  categoryCode: 'CS100006',
  categoryName: '커피·음료',
  lat: 37.5203,
  lng: 127.0229,
  isPrimary: id === 1,
}))

// 스토리는 네트워크 없이 렌더 — 가게 목록을 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(storeKeys.myStores(), storesMock)
  return queryClient
}

/**
 * 내 가게 설정 전체 화면. Figma: `[4-2] 가게위치 변경하기/2. 317:6772` ·
 * API: `GET /api/v1/users/me/stores`.
 */
const meta = {
  title: 'My/MyStorePage',
  component: MyStorePage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={seededClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MyStorePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/my/store']}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

/** 신규 등록 직후 — 하단에 "새로운 주소가 등록되었습니다." 토스트(2.5초 후 사라짐). */
export const WithToast: Story = {
  name: '등록 완료 토스트',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={[{ pathname: '/my/store', state: { added: true } }]}>
        <Story />
      </MemoryRouter>
    ),
  ],
}
