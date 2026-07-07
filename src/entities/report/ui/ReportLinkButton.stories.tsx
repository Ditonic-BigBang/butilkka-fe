import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportLinkButton } from './ReportLinkButton'

/** 리포트 이동 버튼 — AI 리포트 화면의 다크 버튼. Figma: Button_리포트 확인하기 427:18647. */
const meta = {
  title: 'Report/ReportLinkButton',
  component: ReportLinkButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'AI 리포트 화면에 띄우는 리포트 이동 버튼 (클릭 → 상세). **Figma:** `427:18647`',
          '',
          '| 요소 | 값 |',
          '|---|---|',
          '| 컨테이너 | `bg-gray-900` · `rounded-12` · `p-4`(16) · 풀폭 |',
          '| 분기 | `text-body-m-medium` · `gray-90` |',
          '| 등급 | `text-body-m-semibold` · white |',
          '| 안내+화살표 | `text-body-m-medium` · `gray-200` · `ci/chevron-right` |',
          '',
          '네비게이션은 페이지가 `onClick` 으로 처리.',
        ].join('\n'),
      },
    },
  },
  args: { quarter: '2026년 1분기', grade: 'B' },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportLinkButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
