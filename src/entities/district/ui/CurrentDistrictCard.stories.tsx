import type { Meta, StoryObj } from '@storybook/react-vite'
import storeIllustration from '@/shared/assets/illustrations/store.png'
import { CurrentDistrictCard } from './CurrentDistrictCard'

const Illustration = () => <img src={storeIllustration} alt="" className="w-[93px]" />

/** 홈 현재 상권 히어로 카드. Figma: Card_홈_현재상권 554:12983. */
const meta = {
  title: 'District/CurrentDistrictCard',
  component: CurrentDistrictCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '홈 현재 상권 히어로 카드. **Figma:** `554:12983`',
          '',
          '- 제목 + 등급(40px)·상태 칩(등급→상태: A 양호~E 위험)',
          '- **A~E 게이지**: 현재 등급까지 오렌지 fill + 현재 위치 흰 링',
          '- 지난 분기 등급 pill(info-blue). 우상단 가게 일러스트는 `illustration` 슬롯',
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
    grade: 'C',
    lastGrade: 'B등급',
    illustration: <Illustration />,
    onViewLast: () => {},
  },
} satisfies Meta<typeof CurrentDistrictCard>

export default meta
type Story = StoryObj<typeof meta>

/** C등급(주의) — 게이지 A~C 채움. */
export const GradeC: Story = {
  name: 'C등급 (주의)',
}

/** A등급(양호) — 게이지 시작점. */
export const GradeA: Story = {
  name: 'A등급 (양호)',
  args: { grade: 'A', lastGrade: 'B등급' },
}

/** E등급(위험) — 게이지 끝까지. */
export const GradeE: Story = {
  name: 'E등급 (위험)',
  args: { grade: 'E', lastGrade: 'D등급' },
}
