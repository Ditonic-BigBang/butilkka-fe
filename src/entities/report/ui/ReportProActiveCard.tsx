import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

type ReportProActiveCardProps = {
  /** 카드 탭 (리포트로 이동 등) */
  onClick?: () => void
  className?: string
}

/**
 * 리포트 PRO 이용중 카드 (Figma: Card 후 1185:13556).
 * 다크 배경. 티켓 아이콘 + "리포트 PRO 이용중" + 안내문, 우측 chevron. 구독 상태에서 노출.
 */
export function ReportProActiveCard({ onClick, className }: ReportProActiveCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full press-soft items-center justify-between gap-2 rounded-12 bg-gray-900 px-4 py-3 text-left',
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2">
          <TicketIcon className="size-6 shrink-0" />
          <span className="text-body-m-semibold text-white">리포트 PRO 이용중</span>
        </span>
        <span className="text-body-m-regular text-white">더 자세한 상권 분석을 받고 있어요!</span>
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-100" />
    </button>
  )
}

/** 티켓 아이콘 (Figma 1185:13547) — coolicons 미제공이라 인라인 SVG(오렌지 + 별 그라데이션) */
function TicketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M20.85 12.0001C20.85 10.9231 21.723 10.0501 22.8 10.0501V5.12769C22.8 4.58529 22.3602 4.14609 21.8184 4.14609H2.1816C1.6392 4.14609 1.2 4.58589 1.2 5.12769V10.0501C2.277 10.0501 3.15 10.9231 3.15 12.0001C3.15 13.0771 2.277 13.9501 1.2 13.9501V18.8725C1.2 19.4149 1.6398 19.8541 2.1816 19.8541H21.8178C22.3602 19.8541 22.7994 19.4143 22.7994 18.8725V13.9501C21.7224 13.9501 20.85 13.0771 20.85 12.0001Z"
        fill="var(--color-key)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1542 7.37871C12.2272 7.37871 12.2847 7.44179 12.2772 7.51445L11.9881 10.3191H13.3944C14.9411 10.3192 16.1951 11.5732 16.1952 13.1199C16.1951 15.0533 14.6276 16.6208 12.6942 16.6209H8.14831C8.07572 16.6205 8.01896 16.5574 8.02624 16.4852L8.95202 7.48906C8.95851 7.42642 9.01115 7.37894 9.07409 7.37871H12.1542ZM11.6942 12.9598L10.3143 13.4705L11.6942 13.9812L12.2049 15.3611L12.7147 13.9812L14.0946 13.4705L12.7147 12.9598L12.2049 11.5799L11.6942 12.9598Z"
        fill="url(#report-pro-ticket-star)"
      />
      <defs>
        <linearGradient
          id="report-pro-ticket-star"
          x1="8.02561"
          y1="11.9998"
          x2="16.1952"
          y2="11.9998"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC78A" />
          <stop offset="1" stopColor="#FF9058" />
        </linearGradient>
      </defs>
    </svg>
  )
}
