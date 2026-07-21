import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportPaywallCard } from './ReportPaywallCard'

/** 리포트 PRO 결제 유도 카드. Figma: `Card_요금제 현질유도 1194:14859`. */
const meta = {
  title: 'Report/ReportPaywallCard',
  component: ReportPaywallCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '리포트 PRO 결제 유도 카드. **Figma:** `Card_요금제 현질유도 1194:14859`',
          '',
          '- 🎫 티켓(로컬 SVG) + 타이틀(24px bold) + PRO 안내(gray-600)',
          '- [확인하러 가기] key 필 버튼 — `onConfirm` 으로 구독 화면 이동',
          '- 구분선(gray-90) + Pro 혜택 4줄. 흰 카드 · key 테두리 · rounded-16',
          '- 구독 전 잠긴 화면(블러) 위에 띄운다 — `PaywallLock` 위젯이 감싼다',
          '- 리포트·지도가 같은 카드를 쓰므로 `title`/`description` 으로 카피만 갈아끼운다',
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

/** 리포트 잠금 — 기본 카피 */
export const Default: Story = {}

/** 지도 잠금 — 카피만 지도용으로 교체 */
export const Map: Story = {
  name: '지도 카피',
  args: {
    title: '서울 상권 지도를\n확인해보세요',
    description: 'PRO에서 상권별 쇠퇴 지표와\n랭킹을 모두 볼 수 있어요.',
  },
}
