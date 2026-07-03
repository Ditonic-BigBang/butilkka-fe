import type { Meta, StoryObj } from '@storybook/react-vite'
import Building from '~icons/ci/building-04'
import Coffee from '~icons/ci/coffee'
import Moon from '~icons/ci/moon'
import User from '~icons/ci/user'
import { AnalysisCard } from './AnalysisCard'

const ICON = 'size-[18px] shrink-0 text-orange-400'

/** 리포트 분석 카드 (선행 신호 / 원인 분석). Figma: 372:12800·13708. */
const meta = {
  title: 'Report/AnalysisCard',
  component: AnalysisCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '리포트 분석 카드. **Figma:** `Card_M_선행신호` / `Card_M_원인분석`',
          '',
          '- 제목(gray-700 semibold) + [아이콘(orange) + 라벨] 리스트. rounded-12 흰 카드',
          '- `item.value` 있으면 우측에 값(semibold) — **원인 분석**형',
          '- 값 없으면 아이콘+라벨만 — **선행 신호**형',
        ].join('\n'),
      },
    },
  },
  args: { title: '선행 신호', items: [] },
  // 흰 카드라 회색 페이지 배경 위에서만 카드로 보임 (Figma 의도 — 테두리·그림자 없음)
  decorators: [
    (Story) => (
      <div className="bg-gray-70 p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnalysisCard>

export default meta
type Story = StoryObj<typeof meta>

/** 선행 신호 — 아이콘 + 라벨 (값 없음). */
export const Signals: Story = {
  name: '선행 신호',
  args: {
    title: '선행 신호',
    items: [
      { icon: <Building className={ICON} />, label: '무인 점포 증가율 증가' },
      { icon: <Coffee className={ICON} />, label: '요식업 폐업 신호 증가' },
      { icon: <Moon className={ICON} />, label: '유동인구 야간시간대 감소' },
    ],
  },
}

/** 원인 분석 — 아이콘 + 라벨 + 우측 값. */
export const Causes: Story = {
  name: '원인 분석',
  args: {
    title: '원인 분석',
    items: [
      { icon: <User className={ICON} />, label: '명동 외국인 관광객', value: '감소' },
      { icon: <Building className={ICON} />, label: '오피스 공실률', value: '높음' },
      { icon: <Building className={ICON} />, label: '을지로 재개발 압력', value: '높음' },
    ],
  },
}
