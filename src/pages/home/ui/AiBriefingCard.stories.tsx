import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiBriefingCard } from './AiBriefingCard'

/** AI 한 줄 브리핑 카드. Figma: `558:12455`. */
const meta = {
  title: 'Home/AiBriefingCard',
  component: AiBriefingCard,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-gray-70 p-5">
        <Story />
      </div>
    ),
  ],
  args: {
    message: '최근 1년간 유동인구 감소와\n공실 증가가 동시에 나타나고 있어요.',
    onClick: () => {},
  },
} satisfies Meta<typeof AiBriefingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
