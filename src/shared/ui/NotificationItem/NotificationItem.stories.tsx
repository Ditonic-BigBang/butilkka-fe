import type { Meta, StoryObj } from '@storybook/react-vite'
import { NotificationItem } from './NotificationItem'

/** 알림 리스트 항목. Figma: Alert 424:10393. */
const meta = {
  title: 'UI/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '알림 리스트 항목 (탭 → 이동). **Figma:** `424:10393` (Read / Not Read)',
          '',
          '- 문서 아이콘(`info-blue`) + [카테고리(14px gray-400) · 날짜(12px gray-400, 우측)] / 제목(16px semibold gray-900) / 액션(14px gray-500)',
          '- **안 읽음**: `info-blue-soft` 배경 강조 / **읽음**: 흰 배경 (배경만 차이)',
        ].join('\n'),
      },
    },
  },
  args: {
    category: '정기 알림',
    date: '2025.12.25',
    title: '2026년 1분기 AI 리포트가 발행됐어요',
    action: '보러가기 →',
    onClick: () => {},
  },
} satisfies Meta<typeof NotificationItem>

export default meta
type Story = StoryObj<typeof meta>

/** 안 읽음 — soft-blue 배경 강조. */
export const NotRead: Story = {
  name: '안 읽음',
  args: { read: false },
}

/** 읽음 — 흰 배경. */
export const Read: Story = {
  name: '읽음',
  args: { read: true },
}

/** 리스트 — 안 읽음(강조) + 읽음 섞임. */
export const List: Story = {
  name: '리스트',
  render: (args) => (
    <div className="w-full">
      <NotificationItem {...args} read={false} />
      <NotificationItem
        category="정기 알림"
        date="2025.09.25"
        title="2025년 4분기 AI 리포트가 발행됐어요"
        action="보러가기 →"
        read
      />
      <NotificationItem
        category="공지"
        date="2025.09.01"
        title="서비스 점검 안내 (9/3 02:00~04:00)"
        read
      />
    </div>
  ),
}
