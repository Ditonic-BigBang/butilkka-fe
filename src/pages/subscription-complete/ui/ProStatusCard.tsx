type ProStatusCardProps = {
  /** 다음 결제일 (예: 2026년 8월 9일) */
  nextBilling: string
  /** 결제금액 (예: 790,000원) */
  price: string
}

/**
 * 리포트 PRO 이용중 요약 카드 (Figma: [4-9] 요금제 과정/3 1256:14587).
 * "리포트 PRO · 이용중" + 다음 결제일 · 결제금액.
 */
export function ProStatusCard({ nextBilling, price }: ProStatusCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-12 border border-gray-100 p-4">
      <div className="flex items-center gap-2">
        <span className="text-body-l-semibold text-gray-900">리포트 PRO</span>
        <span className="rounded-max border border-gray-100 px-2 py-1 text-caption-l-medium text-gray-500">
          이용중
        </span>
      </div>
      <div className="h-px w-full bg-gray-100" />
      <dl className="flex flex-col gap-2 text-body-m-medium text-gray-900">
        <div className="flex items-center justify-between">
          <dt>다음 결제일</dt>
          <dd>{nextBilling}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>결제금액</dt>
          <dd>{price}</dd>
        </div>
      </dl>
    </div>
  )
}
