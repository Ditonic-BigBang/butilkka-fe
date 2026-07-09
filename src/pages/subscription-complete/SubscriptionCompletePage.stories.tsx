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

/** 기본(월간) — state 없이 진입하면 월간으로 표시 */
export const Monthly: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/my/subscription/complete']}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

/** 연간 — 구독 시작하기에서 넘어온 연간 플랜(state) */
export const Annual: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={[{ pathname: '/my/subscription/complete', state: { plan: 'annual' } }]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
}
