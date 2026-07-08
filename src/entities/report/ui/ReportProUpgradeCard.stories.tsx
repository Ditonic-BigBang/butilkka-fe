import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportProUpgradeCard } from './ReportProUpgradeCard'

/** 리포트 PRO 업그레이드 유도 카드(미구독). Figma: Card 전 1185:13554. */
const meta = {
  title: 'Report/ReportProUpgradeCard',
  component: ReportProUpgradeCard,
  parameters: { layout: 'padded' },
  args: { onUpgrade: () => {} },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportProUpgradeCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
