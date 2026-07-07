import type { Meta, StoryObj } from '@storybook/react-vite'
import { MyLocation } from './MyLocation'

/** 내 위치 버튼 — 지도 위 흰 원형 컨트롤. Figma: My Location 477:13758. */
const meta = {
  title: 'UI/MyLocation',
  component: MyLocation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '지도 위 현재 위치 버튼. **Figma:** `477:13758`',
          '',
          '| radius | padding | 아이콘 | 배경 | 그림자 |',
          '|---|---|---|---|---|',
          '| `rounded-max` | `p-2`(8) | 크로스헤어 `size-5` · `gray-300` | `white` | `0 0 5px rgba(0,0,0,.29)` |',
        ].join('\n'),
      },
    },
  },
  // 흰 버튼이라 회색 배경 위에 올려 그림자/형태 확인
  decorators: [
    (Story) => (
      <div className="flex size-24 items-center justify-center rounded-16 bg-gray-90">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyLocation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
