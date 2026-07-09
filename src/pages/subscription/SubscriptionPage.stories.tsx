import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import SubscriptionPage from './SubscriptionPage'

/** 구독 플랜 확인하기 전체 화면. Figma: `[4-9] 요금제 과정 1248:14758`. 데이터 없음(정적). */
const meta = {
  title: 'My/SubscriptionPage',
  component: SubscriptionPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/my/subscription']}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof SubscriptionPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
