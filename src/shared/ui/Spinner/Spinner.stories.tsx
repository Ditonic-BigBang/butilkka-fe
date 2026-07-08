import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'

/** 로딩 스피너. Figma: Loading 477:13033. 다크 트랙 + 오렌지 호 회전. */
const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

/** 기본(46px). */
export const Default: Story = {}

/** 크기 변형 — className(size-*)로 조절. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="size-6" />
      <Spinner className="size-8" />
      <Spinner />
      <Spinner className="size-16" />
    </div>
  ),
}
