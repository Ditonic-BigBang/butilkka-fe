import type { ComponentType, SVGProps } from 'react'
import IconHouse from '~icons/ci/house-01'
import IconMap from '~icons/ci/map'
import IconReport from '~icons/ci/file-document'
import IconUser from '~icons/ci/user-01'

/**
 * 하단 탭 항목 정의 — Figma 디자인 기준 (홈·상권지도·리포트·마이).
 * 아이콘은 coolicons (Iconify `ci`). outline + currentColor 라 text-* 로 색 제어.
 * TODO(라우터): path 는 라우터 도입 시 실제 라우트로 연결 (NavLink 등).
 */
export type TabKey = 'home' | 'map' | 'report' | 'my'

export type TabItem = {
  key: TabKey
  label: string
  path: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const TABS: readonly TabItem[] = [
  { key: 'home', label: '홈', path: '/', Icon: IconHouse },
  { key: 'map', label: '상권지도', path: '/map', Icon: IconMap },
  { key: 'report', label: '리포트', path: '/report', Icon: IconReport },
  { key: 'my', label: '마이', path: '/my', Icon: IconUser },
]
