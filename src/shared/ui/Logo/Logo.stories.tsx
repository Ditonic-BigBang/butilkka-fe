import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'

/** 브랜드 로고 "버틸까". Figma: Logo 558:11717. */
const meta = {
  title: 'UI/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '브랜드 로고 "버틸까". **Figma:** `558:11717`',
          '',
          '배경에 맞춰 색 변형 선택 (색은 고정):',
          '- `solid` — 솔리드 오렌지, 흰/밝은 배경용 (기본)',
          '- `default` — 오렌지 + 흰 아웃라인, 컬러/사진 배경용',
          '- `white` — 흰 글자, 오렌지/어두운 배경용 (앱아이콘·스플래시 중앙)',
          '',
          '크기는 `className` 높이(`h-*`)로 제어, 비율 자동. 브랜드 로고라 로컬 SVG.',
        ].join('\n'),
      },
    },
  },
  args: { variant: 'solid', className: 'h-12' },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

/** 솔리드 오렌지 — 흰/밝은 배경 (GNB 등). */
export const Solid: Story = {
  name: 'Solid (밝은 배경)',
}

/** 오렌지 + 흰 아웃라인 — 컬러/사진 배경. */
export const Default: Story = {
  name: 'Default (컬러 배경)',
  args: { variant: 'default' },
  decorators: [
    (Story) => (
      <div className="rounded-12 bg-gray-500 p-8">
        <Story />
      </div>
    ),
  ],
}

/** 흰 글자 — 오렌지/어두운 배경 (앱아이콘·스플래시 중앙). */
export const White: Story = {
  name: 'White (오렌지 배경)',
  args: { variant: 'white' },
  decorators: [
    (Story) => (
      <div className="rounded-12 bg-key p-8">
        <Story />
      </div>
    ),
  ],
}
