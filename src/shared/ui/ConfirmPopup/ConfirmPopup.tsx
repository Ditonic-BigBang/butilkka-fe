import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type ConfirmPopupProps = {
  open: boolean
  /** 본문 (예: <b>서울 종로구</b>를 삭제하시겠습니까?) */
  children: ReactNode
  cancelLabel?: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
  className?: string
}

/**
 * 중앙 확인 팝업 (Figma: Popup 424:12189).
 * 딤(50%) 위 흰 카드 — 본문 + 우하단 취소/확인 텍스트 버튼(key color).
 * 앱 프레임 안에 absolute 로 덮으므로 부모에 relative 컨테이너가 필요하다.
 */
export function ConfirmPopup({
  open,
  children,
  cancelLabel = '취소',
  confirmLabel = '삭제',
  onCancel,
  onConfirm,
  className,
}: ConfirmPopupProps) {
  if (!open) return null

  return (
    <div
      className={cn(
        'absolute inset-0 z-40 flex items-center justify-center bg-black/50',
        className,
      )}
    >
      {/* 딤 클릭 = 취소 (BottomSheet 백드롭과 같은 패턴) */}
      <button type="button" aria-label="닫기" onClick={onCancel} className="absolute inset-0" />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative flex min-w-[222px] flex-col items-end gap-7 rounded-12 bg-white px-5 py-4 shadow-card"
      >
        <p className="w-full text-center text-body-m-medium text-gray-500">{children}</p>
        <div className="flex items-center gap-4 text-body-m-medium text-key">
          <button type="button" onClick={onCancel} className="px-1 py-0.5">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="px-1 py-0.5">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
