import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChangeIndicator } from './ChangeIndicator'

/** 증감 지표 화살표 — up(빨강)·down(파랑)·same(회색). Figma: Updown 251:3365. */
const meta = {
  title: 'UI/ChangeIndicator',
  component: ChangeIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '지표 증감 표시 화살표 (숫자와 조합해 사용). **Figma:** `251:3365`',
          '',
          '| direction | 모양 | 색 |',
          '|---|---|---|',
          '| up | ▲ | `status-red` (상승=빨강, 한국 증시 관례) |',
          '| down | ▼ | `info-blue` (하락=파랑) |',
          '| same | – | `gray-400` |',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['up', 'down', 'same'] },
  },
} satisfies Meta<typeof ChangeIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Up: Story = { args: { direction: 'up' } }
export const Down: Story = { args: { direction: 'down' } }
export const Same: Story = { args: { direction: 'same' } }

/** 숫자와 조합한 실제 사용 예. */
export const WithValue: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-body-l-semibold">
      <span className="inline-flex items-center gap-1 text-status-red">
        <ChangeIndicator direction="up" /> 12.4%
      </span>
      <span className="inline-flex items-center gap-1 text-info-blue">
        <ChangeIndicator direction="down" /> 3.1%
      </span>
      <span className="inline-flex items-center gap-1 text-gray-400">
        <ChangeIndicator direction="same" /> 0%
      </span>
    </div>
  ),
}
