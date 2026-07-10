import { cn } from '@/shared/lib/cn'
import { Sparkle } from './Sparkle'

type InsightCardProps = {
  /** 라벨 (예: "AI 종합 전망" · "추천 이유") */
  label: string
  /** 강조 소제목 (예: "장기적인 쇠퇴 예상") */
  heading?: string
  /** 본문 (자동 줄바꿈, 강제 개행은 \n) */
  description: string
  /** plain = 흰 배경 / highlight = 그라데이션 + 오렌지 테두리 */
  variant?: 'plain' | 'highlight'
  className?: string
}

/**
 * AI 인사이트 카드 (Figma: Card_L_종합전망 356:11812 / Card_추천이유 356:10202).
 * ✦ 스파클 + 라벨(오렌지) + 본문. rounded-14, 본문 leading-1.6.
 * - `plain`: 흰 배경, 라벨 14px(key), 본문 16px (AI 종합 전망)
 * - `highlight`: 그라데이션 배경 + 오렌지 테두리, 라벨 12px, 소제목 + 본문 14px (추천 이유)
 */
export function InsightCard({
  label,
  heading,
  description,
  variant = 'plain',
  className,
}: InsightCardProps) {
  const highlight = variant === 'highlight'

  return (
    <div
      className={cn(
        'flex w-full flex-col rounded-14 px-4 py-5',
        highlight
          ? 'gap-2 border border-orange-300 bg-linear-to-b from-[#ffe9df] to-[#f8f8f8]'
          : 'gap-4 bg-white',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Sparkle
          className={cn(
            'shrink-0',
            highlight ? 'size-3.5 text-orange-500' : 'size-[17px] text-key',
          )}
        />
        <span
          className={cn(
            highlight ? 'text-caption-l-semibold text-orange-500' : 'text-body-m-semibold text-key',
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {heading && <p className="text-body-l-semibold text-gray-900">{heading}</p>}
        <p
          className={cn(
            'leading-[1.6] font-normal tracking-normal whitespace-pre-line text-gray-700',
            highlight ? 'text-[14px]' : 'text-[16px]',
          )}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
