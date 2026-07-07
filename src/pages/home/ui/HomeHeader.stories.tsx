import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomeHeader } from './HomeHeader'

/** 홈 상단 헤더. Figma: `558:12362`. */
const meta = {
  title: 'Home/HomeHeader',
  component: HomeHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-gray-70">
        <Story />
      </div>
    ),
  ],
  args: {
    location: '서대문구 합정동',
    onLocation: () => {},
    onBell: () => {},
  },
} satisfies Meta<typeof HomeHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
