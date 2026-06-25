import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { TABS, type TabKey } from './tabs'

const tabItem = tv({
  base: 'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors select-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none focus-visible:ring-inset',
  variants: {
    active: {
      // 색 + 굵기 두 가지 신호로 활성 표시 (색만으로 구분하지 않음)
      true: 'font-semibold text-indigo-600',
      false: 'text-gray-400 hover:text-gray-600',
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
 * 하단 내비게이션 (구조 placeholder — 디자인 확정 후 아이콘/항목 교체).
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
            {/* 아이콘 자리 (디자인 확정 후 교체) */}
            <span aria-hidden className="size-6 rounded-md bg-current/15" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
