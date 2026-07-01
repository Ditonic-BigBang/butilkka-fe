import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapPin } from './MapPin'

/** 지도 핀 마커 — active(오렌지) / inactive(다크). Figma: Map Pin 519:11831. */
const meta = {
  title: 'UI/MapPin',
  component: MapPin,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '지도 위 물방울 핀 + 흰 깃발 아이콘. **Figma:** `519:11831`',
          '',
          '| variant | 채움 | 테두리 | 깃발 |',
          '|---|---|---|---|',
          '| active | `key` | `orange-700` | `orange-10` |',
          '| inactive | `gray-900` | `orange-400` | `orange-10` |',
          '',
          '크기: `w-[46px]` · `h-[55px]`. 실제 Figma SVG 경로 사용.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['active', 'inactive'] },
  },
} satisfies Meta<typeof MapPin>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = { args: { variant: 'active' } }
export const Inactive: Story = { args: { variant: 'inactive' } }

export const Pair: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <MapPin variant="active" />
      <MapPin variant="inactive" />
    </div>
  ),
}
