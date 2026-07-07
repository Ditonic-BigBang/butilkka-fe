import type { Meta, StoryObj } from '@storybook/react-vite'
import { LocationMarker } from './LocationMarker'

/** 지도 위치 마커 — gray-900 원형 + 흰 텍스트. Figma: Location container 336:7579. */
const meta = {
  title: 'UI/LocationMarker',
  component: LocationMarker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '지도 위에 올리는 원형 마커 — 지역명 + 보조값. **Figma:** `336:7579`',
          '',
          '| 요소 | 값 |',
          '|---|---|',
          '| 컨테이너 | `size-[94px]` · `rounded-max` · `bg-gray-900` · shadow `0 0 16px rgba(0,0,0,.06)` |',
          '| title | `text-body-m-semibold` · white |',
          '| caption | `text-body-m-medium` · white |',
        ].join('\n'),
      },
    },
  },
  args: { title: '서대문구', caption: '134,302명' },
} satisfies Meta<typeof LocationMarker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const TitleOnly: Story = { args: { caption: undefined } }
