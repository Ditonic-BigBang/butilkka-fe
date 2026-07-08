import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/session'
import MyPage from './MyPage'
import { notificationSettingsKeys } from './model/notificationSettingsApi'

// 스토리는 네트워크 없이 렌더 — 알림 설정을 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(notificationSettingsKeys.detail(), {
    smsAlert: true,
    autoReport: true,
    urgentAlert: false,
  })
  return queryClient
}

// 내 가게 카드는 세션 user.store 에서 읽는다 — Figma 예시 데이터로 시드.
function seedAuthedUser(isReportPro = false) {
  useAuthStore.setState({
    status: 'authenticated',
    user: {
      id: 1,
      name: '홍길동',
      isOnboarded: true,
      isReportPro,
      store: {
        regionCode: '3110001',
        regionName: '가로수길',
        categoryCode: 'CS100006',
        categoryName: '커피·음료',
        lat: 37.5203,
        lng: 127.0229,
        storeName: '뽀짜이 베트남쌀국수 명동본점',
        address: '서울 중구 명동10길 52 신한익스페이스',
      },
    },
  })
}

function decorate(isReportPro: boolean) {
  return (Story: () => React.ReactElement) => {
    seedAuthedUser(isReportPro)
    return (
      <QueryClientProvider client={seededClient()}>
        <MemoryRouter initialEntries={['/my']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

/**
 * 마이페이지 전체 화면. Figma: `[4-1] 기본 286:5268` ·
 * API: `GET/PATCH /api/v1/users/me/notification-settings`.
 */
const meta = {
  title: 'My/MyPage',
  component: MyPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MyPage>

export default meta
type Story = StoryObj<typeof meta>

/** 구독 전 — 리포트 PRO 업그레이드 카드 노출. */
export const Default: Story = {
  decorators: [decorate(false)],
}

/** 구독 후 — 리포트 PRO 이용중 카드 노출. */
export const ReportPro: Story = {
  name: '리포트 PRO 구독중',
  decorators: [decorate(true)],
}
