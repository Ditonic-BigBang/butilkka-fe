import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportPaywallCard } from './ReportPaywallCard'

/** 데이터 구독 결제 유도 카드. Figma: `Card_요금제 현질유도 1835:16932`. */
const meta = {
  title: 'Report/ReportPaywallCard',
  component: ReportPaywallCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '데이터 구독 결제 유도 카드. **Figma:** `Card_요금제 현질유도 1835:16932`',
          '',
          '- 🎫 티켓(로컬 SVG) + 타이틀(24px bold) + 안내문(gray-600)',
          '- [확인하러 가기] key 필 버튼 — `onConfirm` 으로 구독 화면 이동',
          '- 구분선(gray-90) + 데이터 구독 혜택 5줄. 흰 카드 · key 테두리 · rounded-16',
          '- 구독 전 잠긴 화면(블러) 위에 띄운다 — `PaywallLock` 위젯이 감싼다',
          '- 리포트·지도가 같은 카드를 같은 내용으로 쓴다',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-70 p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportPaywallCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
