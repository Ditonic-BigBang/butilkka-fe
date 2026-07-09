import { cn } from '@/shared/lib/cn'

type PlanCardProps = {
  /** 플랜 이름 (연간 / 월간) */
  name: string
  /** 가격 (예: 76,800원) */
  price: string
  /** 가격 앞 단위 (예: 연) */
  pricePrefix?: string
  /** 보조 가격 (예: 월 6,400원) */
  subPrice?: string
  /** 선택 여부 — key 2px 테두리 */
  selected?: boolean
  /** 좌상단에 걸치는 배지 (예: 약 20% 절약) */
  badge?: string
  onSelect?: () => void
}

/**
 * 요금제 카드 (Figma: [4-9] 요금제 과정 1194:15691 · Card1/Card).
 * 이름 + 가격(+보조가격) 한 줄. 선택 시 key 2px 테두리, 연간 카드엔 절약 배지가 위에 걸친다.
 */
export function PlanCard({
  name,
  price,
  pricePrefix,
  subPrice,
  selected,
  badge,
  onSelect,
}: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-center justify-between rounded-12 bg-white p-5 text-left transition-colors',
        selected ? 'border-2 border-key' : 'border border-gray-100',
      )}
    >
      {badge && (
        <span className="absolute -top-2.5 left-3 rounded-max bg-gray-900 px-2 py-1 text-caption-l-medium text-gray-70">
          {badge}
        </span>
      )}
      <span className="text-title-s-semibold text-gray-900">{name}</span>
      <span className="flex flex-col items-end gap-1">
        <span className="flex items-center gap-1">
          {pricePrefix && <span className="text-body-l-medium text-gray-500">{pricePrefix}</span>}
          <span className="text-title-s-semibold text-gray-900">{price}</span>
        </span>
        {subPrice && <span className="text-body-m-regular text-gray-500">{subPrice}</span>}
      </span>
    </button>
  )
}
