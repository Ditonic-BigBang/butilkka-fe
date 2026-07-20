import { cn } from '@/shared/lib/cn'

/**
 * 스켈레톤 뼈대 — 전역 `skeleton` shimmer 유틸을 쓰는 알약(pill) 바.
 * 형태(크기·라운드 오버라이드)만 지정해서 쓴다. 예) <Bone className="h-3.5 w-24" />
 * 요소를 전부 그리면 와이어프레임처럼 보이므로, 카드당 라벨·본문 정도만 남기고 여백으로 정리한다.
 */
export function Bone({ className }: { className?: string }) {
  return <span aria-hidden className={cn('block skeleton rounded-full', className)} />
}
