import { useState } from 'react'
import { TABS, type TabKey } from './tabs'

/**
 * 활성 탭 상태의 단일 출처(seam).
 * 지금은 useState 로 관리한다. 라우터 도입 시 이 함수 내부만
 * `useLocation()` → tab, `navigate()` → setTab 으로 교체하면
 * 소비처(MobileLayout / BottomTab)는 수정할 필요가 없다.
 */
export function useActiveTab(initial: TabKey = TABS[0].key) {
  const [tab, setTab] = useState<TabKey>(initial)
  return { tab, setTab }
}
