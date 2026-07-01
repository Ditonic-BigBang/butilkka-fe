import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { TABS, type TabKey } from '../model/tabs'

const tabItem = tv({
  base: 'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-caption-m-regular transition-colors select-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none focus-visible:ring-inset',
  variants: {
    active: {
      // 활성 = 명도 대비(gray-900 vs gray-300, Figma 디자인대로). 색만 의존하지만
      // 명도 차이라 색각이상에도 구분되고, aria-current 로 스크린리더도 대응.
      true: 'text-gray-900',
      false: 'text-gray-300 hover:text-gray-500',
    },
  },
  defaultVariants: { active: false },
})

type BottomTabProps = {
  /** 제어 모드: 외부(라우터)가 활성 탭을 지정 */
  activeTab?: TabKey
  /** 비제어 모드 초기 활성 탭 */
  defaultTab?: TabKey
  onTabChange?: (tab: TabKey) => void
}

/**
 * 하단 내비게이션 (Figma 디자인 기준 · coolicons 아이콘).
 * 제어/비제어 겸용: props 없이도 자체 상태로 동작하고, activeTab/onTabChange 를
 * 주면 부모가 제어한다. 표현 전용이라 단위 테스트가 쉽고 라우터 연결도 간단하다.
 */
export function BottomTab({ activeTab, defaultTab = TABS[0].key, onTabChange }: BottomTabProps) {
  const [internal, setInternal] = useState<TabKey>(defaultTab)
  const active = activeTab ?? internal

  const handleSelect = (tab: TabKey) => {
    if (activeTab === undefined) setInternal(tab)
    onTabChange?.(tab)
  }

  return (
    <nav
      aria-label="메인 내비게이션"
      className="flex shrink-0 items-stretch border-t border-gray-200 bg-white pb-safe-bottom-or-3"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleSelect(tab.key)}
            className={tabItem({ active: isActive })}
          >
            <tab.Icon aria-hidden className="size-6" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
