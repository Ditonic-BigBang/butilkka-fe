import { useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type BottomSheetProps = {
  /** 열림 여부 (제어) */
  open: boolean
  onClose?: () => void
  /** 헤더 제목 */
  title?: string
  /** 헤더 부제 */
  subtitle?: string
  children: ReactNode
  className?: string
}

// 아래로 이만큼(px) 끌면 닫힘
const DISMISS_THRESHOLD = 100

/**
 * 바텀시트 셸 (Figma: Bottom Sheet 353:10218).
 * 하단 고정 · rounded-t-20 · shadow-upper · 핸들 + 헤더(제목·부제) + 스크롤 콘텐츠 슬롯.
 * 핸들을 아래로 끌거나 백드롭을 탭하면 닫힘. 최대 높이 646px.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDialogElement>(null)
  const dragging = useRef(false)
  const startY = useRef(0)

  if (!open) return null

  // 드래그 중엔 setState 없이 DOM transform 만 직접 조작 — 프레임마다 리렌더하지 않는다.
  // 손을 떼면 인라인 값을 걷어 기본 transition 이 원위치 스냅을 이어받는다. (RankingSheet 패턴)
  const resetSheetStyle = () => {
    if (!sheetRef.current) return
    sheetRef.current.style.transitionProperty = ''
    sheetRef.current.style.transform = ''
  }
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !sheetRef.current) return
    const dy = Math.max(0, e.clientY - startY.current)
    sheetRef.current.style.transitionProperty = 'none'
    sheetRef.current.style.transform = `translateY(${dy}px)`
  }
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    resetSheetStyle()
    if (e.clientY - startY.current > DISMISS_THRESHOLD) onClose?.()
  }
  const handlePointerCancel = () => {
    dragging.current = false
    resetSheetStyle()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <dialog
        open
        ref={sheetRef}
        aria-label={title}
        className={cn(
          'relative m-0 flex max-h-[min(646px,90dvh)] w-full flex-col rounded-t-[20px] border-0 bg-white p-0 text-inherit shadow-upper',
          className,
        )}
        style={{ transition: 'transform 0.25s ease' }}
      >
        {/* 핸들 (드래그로 닫기) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="flex h-[26px] shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        >
          <span className="h-1.5 w-[50px] rounded-full bg-gray-90" />
        </div>

        {/* 헤더 */}
        {(title || subtitle) && (
          <div className="flex shrink-0 flex-col gap-0.5 border-b border-gray-90 px-5 pb-4">
            {title && <p className="text-title-s-semibold text-gray-900">{title}</p>}
            {subtitle && <p className="text-body-l-medium text-gray-500">{subtitle}</p>}
          </div>
        )}

        {/* 콘텐츠 (스크롤) */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </dialog>
    </div>
  )
}
