import type { ComponentType, SVGProps } from 'react'
import IconBarChart from '~icons/ci/bar-chart'
import IconBuilding from '~icons/ci/building-04'
import IconCoffee from '~icons/ci/coffee'
import IconMoon from '~icons/ci/moon'
import IconUsersGroup from '~icons/ci/users-group'

export type AnalysisIcon = ComponentType<SVGProps<SVGSVGElement>>

// 키워드 → 아이콘 (앞선 규칙 우선). 원인·선행신호 라벨은 서버 자유 텍스트라 키워드로 추정한다.
const ICON_RULES: readonly [RegExp, AnalysisIcon][] = [
  [/야간|심야/, IconMoon],
  [/인구|관광객|고객|방문/, IconUsersGroup],
  [/요식|폐업|음식|식당|카페/, IconCoffee],
  [/공실|점포|재개발|오피스|임대|상가/, IconBuilding],
]

/** 분석 항목 라벨에 어울리는 아이콘 선택 (매칭 없으면 지표 아이콘) */
export function pickAnalysisIcon(label: string): AnalysisIcon {
  return ICON_RULES.find(([pattern]) => pattern.test(label))?.[1] ?? IconBarChart
}
