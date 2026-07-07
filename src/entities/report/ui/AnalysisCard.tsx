import { cn } from '@/shared/lib/cn'

type AnalysisItem = {
  /** 좌측 아이콘 (예: orange-400 18px) */
  icon: React.ReactNode
  label: string
  /** 우측 값 (예: "감소"·"높음") — 있으면 값 표시(원인분석형), 없으면 아이콘+라벨만(선행신호형) */
  value?: string
}

type AnalysisCardProps = {
  /** 카드 제목 (예: "선행 신호"·"원인 분석") */
  title: string
  items: AnalysisItem[]
  className?: string
}

/**
 * 리포트 분석 카드 (Figma: Card_M_선행신호 / Card_M_원인분석 372:12800·13708).
 * 제목(gray-700 semibold) + [아이콘 + 라벨 (+우측 값)] 리스트. rounded-12 흰 카드.
 * `item.value` 있으면 우측에 값(semibold) 표시(원인분석), 없으면 아이콘+라벨만(선행신호).
 */
export function AnalysisCard({ title, items, className }: AnalysisCardProps) {
  return (
    <div className={cn('flex w-full flex-col gap-4 rounded-12 bg-white px-4 py-5', className)}>
      <p className="text-body-m-semibold text-gray-700">{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              {item.icon}
              <span className="truncate text-body-l-regular text-gray-700">{item.label}</span>
            </span>
            {item.value && (
              <span className="shrink-0 text-body-l-semibold text-gray-700">{item.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
