import type { ReactNode } from 'react'
import ChevronLeft from '~icons/ci/chevron-left'
import Settings from '~icons/ci/settings'
import Close from '~icons/ci/close-md'
import MapPinIcon from '~icons/ci/map-pin'
import Bell from '~icons/ci/bell'
import { cn } from '@/shared/lib/cn'

type GNBProps = {
  /** default: 뒤로·타이틀·설정 · home: 위치·알림 */
  variant?: 'default' | 'home'
  className?: string
  // default variant
  /** 가운데 타이틀 */
  title?: string
  /** 왼쪽 뒤로가기 (기본 true) */
  showBack?: boolean
  /** 오른쪽 설정 (기본 true) */
  showSettings?: boolean
  onBack?: () => void
  onSettings?: () => void
  /** 오른쪽 닫기(X) — 설정 대신 X 노출 (완료 화면 등) */
  onClose?: () => void
  /** 오른쪽 커스텀 슬롯 — 지정 시 설정/닫기 대신 렌더 (예: 지난 리포트 undo) */
  right?: ReactNode
  // home variant
  /** 현재 위치 (예: 마포구 00동) */
  location?: string
  onLocation?: () => void
  onBell?: () => void
}

const ICON = 'size-6 shrink-0 text-gray-300'

/**
 * 상단 네비게이션 바 (Figma: GNB 477:13736).
 * - `default`: 뒤로가기(토글) · 타이틀 · 설정(토글) — "뒤로만/설정없이"는 `showBack`/`showSettings` 로.
 * - `home`: 현재 위치(📍) · 알림(🔔), 배경 gray-70.
 * 표현 전용 — 라우팅/동작은 페이지가 핸들러로 처리.
 */
export function GNB({
  variant = 'default',
  className,
  title = '',
  showBack = true,
  showSettings = true,
  onBack,
  onSettings,
  onClose,
  right,
  location = '',
  onLocation,
  onBell,
}: GNBProps) {
  if (variant === 'home') {
    return (
      <header
        className={cn('flex h-[50px] items-center justify-between bg-gray-70 px-5 py-3', className)}
      >
        <button type="button" onClick={onLocation} className="flex items-center gap-1">
          <MapPinIcon aria-hidden className={ICON} />
          <span className="text-body-l-medium text-gray-700">{location}</span>
        </button>
        <button type="button" onClick={onBell} aria-label="알림">
          <Bell aria-hidden className={ICON} />
        </button>
      </header>
    )
  }

  return (
    <header
      className={cn('flex h-[50px] items-center justify-between bg-white px-5 py-3', className)}
    >
      <div className="flex w-6 justify-start">
        {showBack && (
          <button type="button" onClick={onBack} aria-label="뒤로 가기">
            <ChevronLeft aria-hidden className={ICON} />
          </button>
        )}
      </div>
      <p className="text-title-s-semibold whitespace-nowrap text-gray-900">{title}</p>
      <div className="flex w-6 justify-end">
        {right ??
          (onClose ? (
            <button type="button" onClick={onClose} aria-label="닫기">
              <Close aria-hidden className={ICON} />
            </button>
          ) : (
            showSettings && (
              <button type="button" onClick={onSettings} aria-label="설정">
                <Settings aria-hidden className={ICON} />
              </button>
            )
          ))}
      </div>
    </header>
  )
}
