import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bone } from './Bone'

/** 스켈레톤 뼈대 — 전역 `skeleton` shimmer 유틸을 쓰는 알약(pill) 바. */
const meta = {
  title: 'UI/Bone',
  component: Bone,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '스켈레톤 뼈대 — 전역 `skeleton` shimmer 유틸(gray-90 바탕 + 좌→우 밝은 띠)을 쓰는 pill 바.',
          '',
          '- 기본 `rounded-full`, 크기·라운드는 `className` 으로 오버라이드',
          '- 카드당 라벨·본문 정도만 남기고 여백으로 정리 (요소를 전부 그리면 와이어프레임처럼 보임)',
          '- `prefers-reduced-motion` 에선 애니메이션 없이 정적 블록',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Bone>

export default meta
type Story = StoryObj<typeof meta>

/** 대표 형태 — 텍스트 줄·칩·등급 블록·그래프 자리 */
export const Shapes: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-3 rounded-12 bg-white p-4">
      <Bone className="h-3.5 w-24" />
      <Bone className="h-3.5 w-full" />
      <Bone className="h-7 w-24 rounded-max" />
      <Bone className="h-9 w-28 rounded-10" />
      <Bone className="h-14 w-full rounded-8" />
    </div>
  ),
}
