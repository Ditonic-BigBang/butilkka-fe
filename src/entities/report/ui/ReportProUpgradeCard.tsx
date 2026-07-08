import { cn } from '@/shared/lib/cn'

type ReportProUpgradeCardProps = {
  /** 업그레이드 버튼 클릭 */
  onUpgrade?: () => void
  className?: string
}

/**
 * 리포트 PRO 업그레이드 유도 카드 (Figma: Card 전 1185:13554).
 * 흰 배경 + key(오렌지) 테두리. "리포트 PRO" 라벨 + 안내문 + 풀폭 오렌지 업그레이드 버튼.
 * 미구독 상태에서 노출한다.
 */
export function ReportProUpgradeCard({ onUpgrade, className }: ReportProUpgradeCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-12 border border-key bg-white px-4 py-3',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-body-m-semibold text-key">리포트 PRO</p>
        <p className="text-body-m-regular text-gray-900">
          혜택을 이용하고 더 자세한 리포트를 받아보세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className="rounded-10 bg-key py-3 text-body-m-semibold text-white transition-colors active:bg-orange-600"
      >
        리포트 업그레이드 하기
      </button>
    </div>
  )
}
