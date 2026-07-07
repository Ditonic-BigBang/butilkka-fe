import type { Meta, StoryObj } from '@storybook/react-vite'
import { GradeGauge } from './GradeGauge'

/** 반원 등급 게이지. Figma: Bottom Sheet Grade 424:12314. */
const meta = {
  title: 'District/GradeGauge',
  component: GradeGauge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '반원 등급 게이지. **Figma:** `424:12314`',
          '',
          '- 오렌지 그라데이션 반원 밴드(둥근 끝) + 방사형 삼각 눈금 5개(흰 컷아웃)',
          '- 중앙에 등급(40px) + 상태(20px)',
        ].join('\n'),
      },
    },
  },
  args: { grade: 'C', status: '주의' },
} satisfies Meta<typeof GradeGauge>

export default meta
type Story = StoryObj<typeof meta>

/** C 주의. */
export const Default: Story = { name: 'C 주의' }

/** A 양호. */
export const GradeA: Story = { name: 'A 양호', args: { grade: 'A', status: '양호' } }

/** E 위험. */
export const GradeE: Story = { name: 'E 위험', args: { grade: 'E', status: '위험' } }
