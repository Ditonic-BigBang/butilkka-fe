import FileDocument from '~icons/ci/file-document'
import { cn } from '@/shared/lib/cn'

type NotificationItemProps = {
  /** 카테고리 (예: "정기 알림") */
  category: string
  /** 날짜 (예: "2025.12.25") */
  date: string
  title: string
  /** 액션 텍스트 (예: "보러가기 →") */
  action?: string
  /** 읽음 여부 — false(안 읽음)면 soft-blue 배경으로 강조 */
  read?: boolean
  onClick?: () => void
  className?: string
}

/**
 * 알림 리스트 항목 (Figma: Alert 424:10393).
 * 문서 아이콘(info-blue) + [카테고리·날짜 / 제목 / 액션]. 탭 시 이동.
 * 안 읽음(read=false)은 soft-blue 배경으로 강조, 읽음은 흰 배경. (배경만 차이)
 */
export function NotificationItem({
  category,
  date,
  title,
  action,
  read = false,
  onClick,
  className,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3.5 px-5 py-4 text-left',
        read ? 'bg-white' : 'bg-info-blue-soft',
        className,
      )}
    >
      <FileDocument aria-hidden className="size-7 shrink-0 text-info-blue" />
      <span className="flex min-w-0 flex-1 flex-col gap-2.5">
        <span className="flex flex-col gap-1">
          <span className="flex items-center justify-between text-gray-400">
            <span className="text-body-m-regular">{category}</span>
            <span className="shrink-0 text-caption-l-regular">{date}</span>
          </span>
          <span className="text-body-l-semibold text-gray-900">{title}</span>
        </span>
        {action && <span className="text-body-m-regular text-gray-500">{action}</span>}
      </span>
    </button>
  )
}
