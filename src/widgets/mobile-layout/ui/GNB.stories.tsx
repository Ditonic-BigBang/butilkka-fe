import type { Meta, StoryObj } from '@storybook/react-vite'
import { GNB } from './GNB'

/** 상단 네비게이션 바 — default(뒤로·타이틀·설정) / home(위치·알림). Figma: GNB 477:13736. */
const meta = {
  title: 'Layout/GNB',
  component: GNB,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '상단 네비 바. **Figma:** `477:13736`',
          '',
          '| variant | 배경 | 왼쪽 | 가운데 | 오른쪽 |',
          '|---|---|---|---|---|',
          '| default | `white` | ‹ 뒤로(`showBack`) | 타이틀 `title-s-semibold` `gray-900` | ⚙ 설정(`showSettings`) |',
          '| home | `gray-70` | 📍 위치 `body-l-medium` `gray-700` | — | 🔔 알림 |',
          '',
          '아이콘 `gray-300` · `size-6`. 높이 `h-[50px]` · `px-5 py-3`. 동작은 페이지가 핸들러로.',
          '',
          '"뒤로가기만 있고 설정 없는 화면" → `showSettings={false}` (별도 컴포넌트 불필요).',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] border-b border-gray-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GNB>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { variant: 'default', title: '알림' } }

/** 뒤로가기만 (설정 없음) — showSettings={false} */
export const BackOnly: Story = {
  args: { variant: 'default', title: '알림', showSettings: false },
}

/** 타이틀만 (뒤로·설정 없음) */
export const TitleOnly: Story = {
  args: { variant: 'default', title: '알림', showBack: false, showSettings: false },
}

export const Home: Story = { args: { variant: 'home', location: '마포구 00동' } }
