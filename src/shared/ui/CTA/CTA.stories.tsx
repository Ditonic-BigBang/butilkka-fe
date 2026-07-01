import type { Meta, StoryObj } from '@storybook/react-vite'
import { CTA } from './CTA'

/** 하단 고정 주요 액션 바 — 오렌지 버튼(key) + 비활성(orange-200). Figma: CTA 300:5672. */
const meta = {
  title: 'UI/CTA',
  component: CTA,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '화면 하단 고정 **주요 액션 바** (Figma: `300:5672`). 흰 배경 바 + 오렌지 버튼.',
          '',
          '| 상태 | 배경 | 텍스트 | 크기 |',
          '|---|---|---|---|',
          '| default | `key` (누르면 `orange-600`) | `white` `text-body-l-semibold` | `h-13`(52) · `rounded-12` · 풀폭 |',
          '| disabled | `orange-200` | `white` | 동일 |',
          '',
          '바깥 바: `px-5`(좌우 20 → 버튼 353) · `pt-3` · `pb-safe-bottom-or-3`(iOS 홈 인디케이터 영역).',
          'Figma 의 검은 홈 인디케이터 바는 렌더링하지 않고 **safe-area 로 대체**.',
        ].join('\n'),
      },
    },
  },
  args: { children: '적용' },
  argTypes: { disabled: { control: 'boolean' } },
} satisfies Meta<typeof CTA>

export default meta
type Story = StoryObj<typeof meta>

/** 실제 배치처럼 폰 화면 하단에 고정된 모습. */
const bottomDecorator = (Story: () => React.ReactElement) => (
  <div className="flex h-dvh flex-col">
    <div className="flex-1" />
    <Story />
  </div>
)

export const Default: Story = {
  args: { disabled: false },
  decorators: [bottomDecorator],
}

export const Disabled: Story = {
  args: { disabled: true },
  decorators: [bottomDecorator],
}
