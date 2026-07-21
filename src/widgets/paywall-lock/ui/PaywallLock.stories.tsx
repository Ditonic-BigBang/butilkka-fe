import type { Meta, StoryObj } from '@storybook/react-vite'
import { PaywallLock } from './PaywallLock'

/** 리포트 본문 대역 — 실제 위젯 대신(같은 레이어 import 금지) 카드 형태만 흉내 낸다 */
function ContentStub() {
  return (
    <div className="flex flex-col gap-3 p-5">
      {[200, 140, 180].map((height) => (
        <div key={height} className="rounded-14 bg-white p-5" style={{ height }}>
          <div className="h-4 w-24 rounded-full bg-gray-100" />
          <div className="mt-6 h-8 w-32 rounded-10 bg-orange-100" />
          <div className="mt-6 h-3 w-full rounded-full bg-gray-90" />
          <div className="mt-2.5 h-3 w-3/5 rounded-full bg-gray-90" />
        </div>
      ))}
    </div>
  )
}

/** 구독 전 화면 잠금 레이어 — 리포트·지도가 공유한다. */
const meta = {
  title: 'Widgets/PaywallLock',
  component: PaywallLock,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '구독(리포트 PRO) 전 화면을 통째로 덮는 잠금 레이어.',
          '',
          '- `children` 있으면 그 내용을 filter 로 흐린다 (리포트: 스켈레톤 → 실제 본문)',
          '- `children` 없으면 이미 그려진 아래 화면을 backdrop-filter 로 흐린다 (지도)',
          '- 오버레이가 포인터 이벤트를 모두 먹어 아래 스크롤·지도 제스처가 막힌다',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-gray-70">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaywallLock>

export default meta
type Story = StoryObj<typeof meta>

/** 리포트 잠금 — 본문을 배경으로 깔고 블러 */
export const WithContent: Story = {
  name: '리포트 (내용 블러)',
  args: {
    className: 'absolute inset-0',
    children: <ContentStub />,
  },
}

/** 지도 잠금 — 배경 없이 아래 화면을 backdrop-blur 로 흐린다 */
export const Backdrop: Story = {
  name: '지도 (backdrop 블러)',
  args: {
    className: 'absolute inset-0',
    title: '서울 상권 지도를\n확인해보세요',
    description: 'PRO에서 상권별 쇠퇴 지표와\n랭킹을 모두 볼 수 있어요.',
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        {/* 지도 대역 — backdrop-blur 가 실제로 흐리는지 확인용 격자 */}
        <div className="grid h-full grid-cols-4 gap-2 p-4">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="rounded-8 bg-white/70" />
          ))}
        </div>
        <Story />
      </div>
    ),
  ],
}
