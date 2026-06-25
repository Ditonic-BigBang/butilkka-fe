/**
 * 하단 탭 항목 정의.
 * TODO(디자인): 아이콘 확정 후 icon 필드 추가.
 * TODO(라우터): path 는 라우터 도입 시 실제 라우트로 연결 (NavLink 등).
 */
export type TabKey = 'home' | 'explore' | 'alerts' | 'my'

export type TabItem = {
  key: TabKey
  label: string
  path: string
}

export const TABS: readonly TabItem[] = [
  { key: 'home', label: '홈', path: '/' },
  { key: 'explore', label: '탐색', path: '/explore' },
  { key: 'alerts', label: '알림', path: '/alerts' },
  { key: 'my', label: '마이', path: '/my' },
]
