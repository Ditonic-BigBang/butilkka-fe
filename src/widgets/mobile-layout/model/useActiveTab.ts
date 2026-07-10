import { useLocation, useNavigate } from 'react-router-dom'
import { TABS, type TabKey } from './tabs'

/**
 * 활성 탭 상태의 단일 출처(seam) — 라우터 연동.
 * 현재 pathname 에서 활성 탭을 유도하고, 탭 선택 시 해당 라우트로 이동한다.
 * 소비처(MobileLayout / BottomTab)는 라우터를 몰라도 된다.
 */
export function useActiveTab() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const tab: TabKey = TABS.find((t) => t.path === pathname)?.key ?? 'home'

  const setTab = (next: TabKey) => {
    const target = TABS.find((t) => t.key === next)
    if (target && target.path !== pathname) navigate(target.path)
  }

  return { tab, setTab }
}
