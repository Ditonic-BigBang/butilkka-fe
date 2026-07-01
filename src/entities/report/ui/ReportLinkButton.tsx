import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

type ReportLinkButtonProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  /** 리포트 분기 (예: 2026년 1분기) */
  quarter: string
  /** 등급 (예: B → "B등급"으로 표시) */
  grade: string
  /** 우측 안내 문구 */
  label?: string
}

/**
 * 리포트 이동 버튼 (Figma: Button_리포트 확인하기 427:18647).
 * AI 리포트 화면에 띄우는 다크 버튼 — 분기·등급 요약 + 우측 안내. 클릭 시 상세 이동.
 * 네비게이션은 페이지가 `onClick` 으로 처리 (엔티티는 라우팅을 모름).
 */
export function ReportLinkButton({
  quarter,
  grade,
  label = '이전 리포트 확인하러 가기',
  className,
  type = 'button',
  ...props
}: ReportLinkButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full items-center justify-between rounded-12 bg-gray-900 p-4 transition-colors active:bg-gray-800',
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-1">
        <span className="text-body-m-medium text-gray-90">{quarter}</span>
        <span className="text-body-m-semibold text-white">{grade}등급</span>
      </span>
      <span className="flex items-center gap-1 text-gray-200">
        <span className="text-body-m-medium">{label}</span>
        <ChevronRight aria-hidden className="size-4 shrink-0" />
      </span>
    </button>
  )
}
