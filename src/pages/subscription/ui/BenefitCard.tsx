type BenefitCardProps = {
  /** 아이콘 SVG(52px) URL */
  icon: string
  /** "혜택 N" */
  label: string
  title: string
  /** 설명 — 줄바꿈(\n) 반영 */
  description: string
}

/**
 * 구독 혜택 카드 (Figma: [4-9] 요금제 과정 1248:14776).
 * 좌측 52px 일러스트 + "혜택 N"(key) · 제목 · 설명. 구독 플랜 페이지에서 4개 반복.
 */
export function BenefitCard({ icon, label, title, description }: BenefitCardProps) {
  return (
    <div className="flex items-center gap-5 rounded-12 border border-gray-100 p-5">
      <img src={icon} alt="" aria-hidden className="size-13 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-caption-l-semibold text-key">{label}</p>
        <p className="text-body-l-semibold text-gray-900">{title}</p>
        <p className="text-body-m-medium whitespace-pre-line text-gray-500">{description}</p>
      </div>
    </div>
  )
}
