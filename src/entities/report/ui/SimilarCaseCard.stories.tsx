import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { SimilarCaseCard } from './SimilarCaseCard'

/** 유사 사례 카드 (펼침/접힘). Figma: Card_L_유사사례 390:17656. */
const meta = {
  title: 'Report/SimilarCaseCard',
  component: SimilarCaseCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '유사 사례 카드 — 펼침/접힘 아코디언. **Figma:** `390:17656`',
          '',
          '- **접힘**: 지역(gray-800) + 기간(gray-400) + 요약(gray-700). 테두리 gray-100',
          '- 헤더 탭 → **펼침**: 구분선 + AI 설명(✦, key) + 관련 태그(gray-90 칩)',
          '- 펼치면 테두리 진해짐(→ gray-500), rounded-12 → rounded-14',
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
  args: {
    region: '광화문',
    period: '2018~2020',
    summary: '오피스 공실이 선행되며 1층 상권 도미노 침체 → 2022년 일부 회복',
    explanation:
      '중구는 향후 1년간 명동 관광상권 침체 요인과 을지로 재개발 압력 신호, 그리고 무인점포 급증이라는 선행 지표로 인해, 과거 광화문·이태원 상권과 유사한 구조적 침체 초입 국면에 진입할 가능성이 높습니다. 다만 서울시 상권 재생 정책 개입 여부에 따라 회복 경로가 갈릴 수 있습니다.',
    tags: ['종로구', '정부 투자', '재개발', '침체 후 회복'],
  },
} satisfies Meta<typeof SimilarCaseCard>

export default meta
type Story = StoryObj<typeof meta>

/** 접힘 — 지역·기간·요약만. */
export const Collapsed: Story = {
  name: '접힘',
  args: { defaultExpanded: false },
}

/** 펼침 — AI 설명 + 관련 태그. */
export const Expanded: Story = {
  name: '펼침',
  args: { defaultExpanded: true },
}

/** 탭 → 펼쳐지며 AI 설명 노출. */
export const Interaction: Story = {
  name: '펼치기',
  args: { defaultExpanded: false },
  play: async ({ canvas, userEvent }) => {
    const header = canvas.getByRole('button')
    await expect(header).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByText('AI가 핵심만 설명할게요')).not.toBeInTheDocument()
    await userEvent.click(header)
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText('AI가 핵심만 설명할게요')).toBeInTheDocument()
  },
}
