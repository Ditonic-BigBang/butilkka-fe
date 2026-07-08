import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportProActiveCard } from './ReportProActiveCard'

/** 리포트 PRO 이용중 카드(구독). Figma: Card 후 1185:13556. */
const meta = {
  title: 'Report/ReportProActiveCard',
  component: ReportProActiveCard,
  parameters: { layout: 'padded' },
  args: { onClick: () => {} },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportProActiveCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
