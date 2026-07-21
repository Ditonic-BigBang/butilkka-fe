import { cn } from '@/shared/lib/cn'

type PlanCardProps = {
  /** 플랜 이름 (예: 연간) */
  name: string
  /** 가격 (예: 790,000원) */
  price: string
  /** 가격 앞 단위 (예: 연) */
  pricePrefix?: string
  className?: string
}

/**
 * 요금제 카드 (Figma: [4-9] 요금제 과정 1194:15691 · Card1/Card).
 * 이름 + 가격 한 줄. 1년 단일 상품이라 선택 UI 없이 key 테두리로 강조만 한다.
 */
export function PlanCard({ name, price, pricePrefix, className }: PlanCardProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between rounded-12 border-2 border-key bg-white p-5',
        className,
      )}
    >
      <span className="text-title-s-semibold text-gray-900">{name}</span>
      <span className="flex items-center gap-1">
        {pricePrefix && <span className="text-body-l-medium text-gray-500">{pricePrefix}</span>}
        <span className="text-title-s-semibold text-gray-900">{price}</span>
      </span>
    </div>
  )
}
