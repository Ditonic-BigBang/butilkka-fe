import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

/** AI 스파클 (Figma "Star 1" 558:12458) — currentColor 라 text-* 로 색 제어 */
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16.7842 16.7842" fill="currentColor" aria-hidden className={className}>
      <path d="M8.39209 0L9.21116 2.22918C10.122 4.70828 12.0759 6.66213 14.555 7.57302L16.7842 8.39209L14.555 9.21116C12.0759 10.122 10.122 12.0759 9.21116 14.555L8.39209 16.7842L7.57302 14.555C6.66213 12.0759 4.70828 10.122 2.22919 9.21116L0 8.39209L2.22918 7.57302C4.70828 6.66213 6.66213 4.70828 7.57302 2.22919L8.39209 0Z" />
    </svg>
  )
}

type AiBriefingCardProps = {
  /** 한 줄 브리핑 문구 (줄바꿈 `\n` 지원) */
  message: string
  onClick?: () => void
  className?: string
}

/**
 * AI 한 줄 브리핑 카드 (Figma: 558:12455).
 * ✦ AI 한 줄 브리핑 라벨(key색) + 요약 문구 + 우측 chevron. 탭하면 상세(리포트 등)로 이동.
 */
export function AiBriefingCard({ message, onClick, className }: AiBriefingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-12 bg-white px-4 py-3 text-left transition-transform duration-150 active:scale-[0.98]',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-center gap-2">
          {/* 카드 등장이 안착할 무렵 별이 1회 팝 (루프 없음) */}
          <SparkleIcon className="size-4 shrink-0 animate-pop-in text-key [animation-delay:250ms]" />
          <span className="text-body-m-semibold text-key">AI 한 줄 브리핑</span>
        </span>
        <span className="text-body-m-medium whitespace-pre-line text-gray-800">{message}</span>
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-300" />
    </button>
  )
}
