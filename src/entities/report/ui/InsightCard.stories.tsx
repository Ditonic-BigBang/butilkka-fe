import type { Meta, StoryObj } from '@storybook/react-vite'
import { InsightCard } from './InsightCard'

/** AI 인사이트 카드. Figma: Card_L_종합전망 / Card_추천이유. */
const meta = {
  title: 'Report/InsightCard',
  component: InsightCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'AI 인사이트 카드. **Figma:** `356:11812`(종합전망) · `356:10202`(추천이유)',
          '',
          '- ✦ 스파클 + 라벨(오렌지) + 본문. rounded-14, 본문 leading-1.6',
          '- **plain**: 흰 배경, 라벨 14px(key), 본문 16px — AI 종합 전망',
          '- **highlight**: 그라데이션 배경 + 오렌지 테두리, 라벨 12px, 소제목 + 본문 14px — 추천 이유',
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
} satisfies Meta<typeof InsightCard>

export default meta
type Story = StoryObj<typeof meta>

/** AI 종합 전망 — 흰 배경, 본문만. */
export const Summary: Story = {
  name: 'AI 종합 전망 (plain)',
  args: {
    label: 'AI 종합 전망',
    description:
      '중구는 향후 1년간 명동 관광상권 침체 요인과 을지로 재개발 압력 신호, 그리고 무인점포 급증이라는 선행 지표로 인해, 과거 광화문·이태원 상권과 유사한 구조적 침체 초입 국면에 진입할 가능성이 높습니다. 다만 서울시 상권 재생 정책 개입 여부에 따라 회복 경로가 갈릴 수 있습니다.',
  },
}

/** 추천 이유 — 그라데이션 + 테두리, 소제목 + 본문. */
export const Recommend: Story = {
  name: '추천 이유 (highlight)',
  args: {
    variant: 'highlight',
    label: '추천 이유',
    heading: '장기적인 쇠퇴 예상',
    description:
      '업종 경쟁력 약화와 배후 인구 감소로 인한 장기적인 쇠퇴가 예상됩니다. 현재 김균석님의 업종은 일식으로, 주변 상권의 일식집이 11곳이 밀집되어 있어 경쟁력이 약하며, 인구 감소가 지속적으로 발생하는 곳으로 이동을 권장합니다.',
  },
}
