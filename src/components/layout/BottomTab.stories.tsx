import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
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

// render 를 대문자 컴포넌트로 분리 — useArgs 훅이 react-hooks 규칙(컴포넌트/훅 내부 호출)에 맞도록
function InteractiveBottomTab(args: ComponentProps<typeof BottomTab>) {
  const [{ activeTab }, updateArgs] = useArgs<{ activeTab?: TabKey }>()
  return (
    <BottomTab
      {...args}
      activeTab={activeTab}
      onTabChange={(tab) => updateArgs({ activeTab: tab })}
    />
  )
}

/**
 * 실제 앱처럼 클릭하면 탭이 전환됨 (제어 모드 + onTabChange 로 activeTab 갱신).
 * 활성 탭은 Controls 패널의 activeTab 으로도 바꿀 수 있음.
 */
export const Default: Story = {
  args: { activeTab: 'home' },
  render: (args) => <InteractiveBottomTab {...args} />,
}
