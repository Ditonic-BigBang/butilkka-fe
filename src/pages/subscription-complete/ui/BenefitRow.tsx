type BenefitRowProps = {
  /** 아이콘 SVG(32px) URL */
  icon: string
  title: string
  subtitle: string
}

/**
 * 이용 중 혜택 행 (Figma: [4-9] 요금제 과정/3 1256:14608).
 * 32px 아이콘 + 제목 + 설명. 구독 완료 화면의 혜택 목록에서 반복.
 */
export function BenefitRow({ icon, title, subtitle }: BenefitRowProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <img src={icon} alt="" aria-hidden className="size-8 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-body-l-semibold text-gray-900">{title}</p>
        <p className="text-body-m-regular text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}
