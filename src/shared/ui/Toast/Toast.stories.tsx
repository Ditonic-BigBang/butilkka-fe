import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'

/** 토스트 — 하단 다크 안내 바. Figma: Toast 373:10078. */
const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '하단에 잠깐 뜨는 안내 바. **Figma:** `373:10078`',
          '',
          '| radius | padding | 폰트 | 배경 | 텍스트 |',
          '|---|---|---|---|---|',
          '| `rounded-12` | `p-4`(16) | `text-body-m-regular` | `gray-800` | `white` |',
          '',
          '`w-full` — 좌우 여백 있는 컨테이너 안에 배치 (Figma 353 = 393−좌우20).',
        ].join('\n'),
      },
    },
  },
  args: { children: '새로운 주소가 등록되었습니다.' },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
