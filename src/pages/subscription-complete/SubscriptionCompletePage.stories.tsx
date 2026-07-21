import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import SubscriptionCompletePage from './SubscriptionCompletePage'

/** 구독 완료 화면. Figma: `[4-9] 요금제 과정/3 1256:14584`. GNB X·CTA 는 홈으로 이동. */
const meta = {
  title: 'My/SubscriptionCompletePage',
  component: SubscriptionCompletePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SubscriptionCompletePage>

export default meta
type Story = StoryObj<typeof meta>

/** 1년 단일 상품 — 연간 790,000원, 다음 결제일은 오늘로부터 +1년 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/my/subscription/complete']}>
        <Story />
      </MemoryRouter>
    ),
  ],
}
