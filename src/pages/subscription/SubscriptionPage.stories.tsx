import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SubscriptionPage from './SubscriptionPage'

/**
 * 구독 플랜 확인하기 전체 화면. Figma: `[4-9] 요금제 과정 1248:14758`.
 * CTA 는 구독 확정(POST /users/me/subscription, 선규격) 뮤테이션 — 스토리에선 호출 없음.
 */
const meta = {
  title: 'My/SubscriptionPage',
  component: SubscriptionPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <MemoryRouter initialEntries={['/my/subscription']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof SubscriptionPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
