import MapPin from '~icons/ci/map-pin'
import Bell from '~icons/ci/bell'
import { cn } from '@/shared/lib/cn'

type HomeHeaderProps = {
  /** 현재 위치 (예: 서대문구 합정동) */
  location: string
  onLocation?: () => void
  onBell?: () => void
  className?: string
}

/**
 * 홈 상단 헤더 (Figma: 558:12362).
 * "홈" 타이틀 + 위치 pill(📍 gray-90) + 알림 벨. 표현 전용 — 동작은 페이지가 핸들러로 처리.
 */
export function HomeHeader({ location, onLocation, onBell, className }: HomeHeaderProps) {
  return (
    <header className={cn('flex items-center justify-between bg-gray-70 px-5 py-4', className)}>
      <div className="flex items-center gap-3">
        <span className="text-title-s-semibold text-gray-900">홈</span>
        <button
          type="button"
          onClick={onLocation}
          className="flex items-center gap-0.5 rounded-max bg-gray-90 p-2"
        >
          <MapPin aria-hidden className="size-5 text-gray-300" />
          <span className="text-body-m-medium text-gray-600">{location}</span>
        </button>
      </div>
      <button type="button" onClick={onBell} aria-label="알림">
        <Bell aria-hidden className="size-6 text-gray-700" />
      </button>
    </header>
  )
}
