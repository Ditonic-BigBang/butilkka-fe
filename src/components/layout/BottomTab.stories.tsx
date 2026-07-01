import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BottomTab } from './BottomTab'
import type { TabKey } from './tabs'

/** 하단 내비게이션 — coolicons 아이콘 + 디자인 토큰(text-caption-m-regular, gray-900/300). */
const meta = {
  title: 'Layout/BottomTab',
  component: BottomTab,
  parameters: {
    layout: 'fullscreen',
    // 하단 바라 전체 폰 높이(852)는 과함 → nav 가 화면 밖으로 감. 짧은 프레임으로 미리보기
    viewport: {
      options: {
        navbar: {
          name: '하단바 미리보기 (393×400)',
          styles: { width: '393px', height: '400px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'navbar', isRotated: false } },
  // 실제 앱(MobileLayout)처럼 nav 를 프레임 하단에 고정 (위는 빈 본문 영역)
  decorators: [
    (Story) => (
      <div className="flex h-dvh flex-col">
        <div className="flex-1" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomTab>

export default meta
type Story = StoryObj<typeof meta>

// 실제 앱(MobileLayout)처럼 부모가 useState 로 활성 탭을 관리 → 클릭하면 전환.
// (Storybook useArgs 는 중첩 컴포넌트에서 invalidHooksError 나므로 순수 React state 사용)
function InteractiveBottomTab() {
  const [tab, setTab] = useState<TabKey>('home')
  return <BottomTab activeTab={tab} onTabChange={setTab} />
}

/** 실제 앱처럼 클릭하면 탭이 전환됨 (부모가 상태 관리하는 제어 모드). */
export const Default: Story = {
  render: () => <InteractiveBottomTab />,
}
