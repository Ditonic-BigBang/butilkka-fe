import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScoreCard } from './ScoreCard'

/** 상권 점수 카드. Figma: Card_M_상권점수 372:14335. */
const meta = {
  title: 'Report/ScoreCard',
  component: ScoreCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '상권 점수 카드. **Figma:** `372:14335`',
          '',
          '- [제목(gray-600 semibold)·기간(gray-300)] + 유형 칩(gray-70)',
          '- [등급(24px bold) + 상태 칩(orange-10/400)] + 위험도 라벨',
          '- **게이지**: 트랙(gray-90) + 오렌지 fill(`progress` 0~1) + 마커 점(`segments`개, fill 안=흰/밖=gray-200)',
          '- 설명(gray-500 medium). rounded-14 흰 카드',
        ].join('\n'),
      },
    },
  },
  args: {
    period: '2026년 2분기',
    type: '쇠퇴형',
    grade: 'C등급',
    status: '주의',
    gaugeLabel: '쇠퇴 위험도',
    progress: 0.64,
    description:
      '현재 상권은 회복보다 쇠퇴 신호가 강하게 나타나고\n있어요. 지금 바로 대응이 필요해요.',
  },
  // 흰 카드라 회색 페이지 배경 위에서만 카드로 보임 (Figma 의도 — 테두리·그림자 없음)
  decorators: [
    (Story) => (
      <div className="bg-gray-70 p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScoreCard>

export default meta
type Story = StoryObj<typeof meta>

/** 쇠퇴형 C등급 — 위험도 게이지 ~64% (마커 3/4 채움). */
export const Decline: Story = {
  name: '쇠퇴형 (C등급)',
}

/** 고위험 D등급 — 게이지 ~90% (마커 4/4). */
export const HighRisk: Story = {
  name: '고위험 (D등급)',
  args: {
    grade: 'D등급',
    status: '위험',
    progress: 0.92,
    description: '쇠퇴 신호가 전방위로 확산되고 있어요.\n즉각적인 대응 전략이 필요합니다.',
  },
}

/** A등급 16% — 점수가 첫 마커(12.5%) 근처라 점을 감싸게 스냅되는 케이스. */
export const SafeA: Story = {
  name: '안전 (A등급, 마커 스냅)',
  args: {
    grade: 'A등급',
    status: '안전',
    progress: 0.16,
    description: '상권이 안정적으로 유지되고 있어요.',
  },
}

/** B등급 38% — 보정 없으면 두 번째 마커(37.5%)를 반으로 자르는 케이스. */
export const StableB: Story = {
  name: '양호 (B등급, 마커 스냅)',
  args: {
    grade: 'B등급',
    status: '양호',
    progress: 0.38,
    description: '일부 지표에 변동이 있지만 양호한 흐름이에요.',
  },
}
