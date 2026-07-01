import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 조건부 className 을 합치고 Tailwind 클래스 충돌을 정리한다.
 * 예) cn('px-2', isActive && 'px-4') -> 'px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
