import ChevronRight from '~icons/ci/chevron-right'
import FileDocument from '~icons/ci/file-document'
import { cn } from '@/shared/lib/cn'

type ReportCardProps = {
  /** 분기 (예: "2026년 1분기") */
  quarter: string
  title: string
  /** 요약 설명 (여러 줄은 \n) */
  summary?: string
  /** 읽음 여부 — false(안 읽음)면 soft-blue 배경으로 강조 */
  read?: boolean
  onClick?: () => void
  className?: string
}

/**
 * 리포트 카드 (Figma: Card_M_리포트 상세보기 372:15244).
 * 문서 아이콘(info-blue) + 분기·제목·요약 + chevron. 탭 시 상세로 이동.
 * 안 읽음(read=false)은 soft-blue 배경으로 강조, 읽음은 흰 배경. (배경만 차이)
 */
export function ReportCard({
  quarter,
  title,
  summary,
  read = false,
  onClick,
  className,
}: ReportCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-transform duration-150 active:scale-[0.98]',
        read ? 'bg-white' : 'bg-info-blue-soft',
        className,
      )}
    >
      <span className="flex min-w-0 items-start gap-3">
        <FileDocument aria-hidden className="size-7 shrink-0 text-info-blue" />
        <span className="flex min-w-0 flex-col gap-2">
          <span className="flex flex-col gap-2">
            <span className="text-caption-l-regular text-gray-500">{quarter}</span>
            <span className="text-body-l-semibold text-gray-900">{title}</span>
          </span>
          {summary && (
            <span className="text-body-m-regular whitespace-pre-line text-gray-700">{summary}</span>
          )}
        </span>
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-300" />
    </button>
  )
}
