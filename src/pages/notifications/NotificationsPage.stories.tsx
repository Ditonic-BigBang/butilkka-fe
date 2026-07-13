import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { notificationKeys } from '@/entities/notification'
import { makeNotificationsMock } from '@/shared/api/mocks/fixtures'
import NotificationsPage from './NotificationsPage'

// 스토리는 네트워크 없이 렌더 — 알림 목 목록을 쿼리 캐시에 시드하고 refetch 를 끈다.
function seededClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(notificationKeys.list(), makeNotificationsMock())
  return queryClient
}

/** 알림 내역 전체 화면. Figma: `[1-2] 알림 내역 247:1619` · API: `GET /api/v1/notifications`. */
const meta = {
  title: 'Notifications/NotificationsPage',
  component: NotificationsPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={seededClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof NotificationsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
