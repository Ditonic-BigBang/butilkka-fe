import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// @theme 커스텀 타이포 토큰 (text-*) — twMerge 가 font-size 로 인식하도록 등록.
// 미등록 시 text-info-blue 같은 커스텀 색과 같은 그룹으로 오분류되어 한쪽이 드랍된다.
const TEXT_STYLES = [
  'headline-medium',
  'title-l-medium',
  'title-m-bold',
  'title-m-semibold',
  'title-s-semibold',
  'body-l-semibold',
  'body-l-medium',
  'body-l-regular',
  'body-m-semibold',
  'body-m-medium',
  'body-m-regular',
  'caption-l-semibold',
  'caption-l-medium',
  'caption-l-regular',
  'caption-m-regular',
]

// @theme 커스텀 색 중 표준 팔레트명이 아닌 것 (gray-*·orange-* 는 표준명이라 자동 인식)
const TEXT_COLORS = ['key', 'status-red', 'status-red-soft', 'info-blue', 'info-blue-soft']

export const tailwindMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [{ text: TEXT_STYLES }],
      'text-color': [{ text: TEXT_COLORS }],
    },
  },
}

const twMerge = extendTailwindMerge(tailwindMergeConfig)

/**
 * 조건부 className 을 합치고 Tailwind 클래스 충돌을 정리한다.
 * 예) cn('px-2', isActive && 'px-4') -> 'px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
