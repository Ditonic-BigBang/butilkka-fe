import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { storeKeys, FALLBACK_CATEGORIES, type MyStore } from '@/entities/store'
import { GNB } from '@/widgets/mobile-layout'
import MyCategoryPage, { CategorySkeleton } from './MyCategoryPage'

const primaryStore: MyStore = {
  storeId: 1,
  storeName: '뽀짜이 베트남쌀국수 명동본점',
  address: '서울 중구 명동10길 52 신한익스페이스',
  storeOpenDate: '2022-08-12',
  regionCode: '3110001',
  regionName: '가로수길',
  categoryCode: 'CS100006',
  categoryName: '커피전문점',
  lat: 37.5203,
  lng: 127.0229,
  isPrimary: true,
}

// 스토리는 네트워크 없이 렌더 — 대표 가게와 업종 목록을 캐시에 시드한다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(storeKeys.myStores(), [primaryStore])
  queryClient.setQueryData(storeKeys.categories(), FALLBACK_CATEGORIES)
  return queryClient
}

/** 업종 설정 전체 화면. Figma: `[4-6] 업종변경 301:7732` · API: `PATCH /users/me/stores/{id}`. */
const meta = {
  title: 'My/MyCategoryPage',
  component: MyCategoryPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={seededClient()}>
        <MemoryRouter initialEntries={['/my/category']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MyCategoryPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 로딩 스켈레톤 — 대표 가게 응답 대기 (shimmer). GNB 는 로딩 중에도 실 UI 그대로 */
export const Skeleton: Story = {
  name: '로딩 스켈레톤',
  render: () => (
    <div className="flex min-h-screen flex-col bg-white">
      <GNB title="업종 설정" showSettings={false} />
      <CategorySkeleton />
    </div>
  ),
}
