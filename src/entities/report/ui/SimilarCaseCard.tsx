import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Sparkle } from './Sparkle'

// 안정 참조(기본값 재생성 방지)
const NO_TAGS: string[] = []

type SimilarCaseCardProps = {
  /** 지역명 (예: "광화문") */
  region: string
  /** 기간 (예: "2018~2020") */
  period: string
  /** 요약 (예: "오피스 공실이 선행되며 ... → 2022년 일부 회복") */
  summary: string
  /** AI 설명 (펼침 시, 자동 줄바꿈) — 없으면 펼침 없는 요약 카드(Figma Variant3, 테두리 없음) */
  explanation?: string
  /** 관련 태그 (펼침 시) */
  tags?: string[]
  /** 펼침 제어 (미지정 시 내부 토글) */
  expanded?: boolean
  defaultExpanded?: boolean
  onToggle?: (expanded: boolean) => void
  className?: string
}

/**
 * 유사 사례 카드 — 펼침/접힘 아코디언 (Figma: Card_L_유사사례 390:17656).
 * 접힘: 지역·기간 + 요약. 헤더 탭 → 펼침: 구분선 + AI 설명(✦) + 관련 태그.
 * 펼치면 테두리가 진해짐(gray-100 → gray-500), rounded-12 → rounded-14.
 * `explanation` 이 없으면 펼침 없는 요약 카드(Variant3 — 테두리 없는 흰 카드)로 렌더된다.
 */
export function SimilarCaseCard({
  region,
  period,
  summary,
  explanation,
  tags = NO_TAGS,
  expanded,
  defaultExpanded = false,
  onToggle,
  className,
}: SimilarCaseCardProps) {
  const [internal, setInternal] = useState(defaultExpanded)
  const open = expanded ?? internal

  const toggle = () => {
    if (expanded === undefined) setInternal(!open)
    onToggle?.(!open)
  }

  // 요약 카드 (Variant3) — 펼칠 내용이 없으니 정적 카드로
  if (explanation === undefined) {
    return (
      <div className={cn('flex w-full flex-col gap-[13px] rounded-12 bg-white p-4', className)}>
        <span className="flex w-full items-start justify-between gap-2">
          <span className="text-body-l-semibold text-gray-800">{region}</span>
          <span className="shrink-0 text-body-m-regular text-gray-400">{period}</span>
        </span>
        <span className="text-body-m-regular text-gray-700">{summary}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full border bg-white transition-colors',
        open ? 'rounded-14 border-gray-500' : 'rounded-12 border-gray-100',
        className,
      )}
    >
      {/* 헤더 (탭 → 펼침 토글) */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full flex-col gap-[13px] p-4 text-left"
      >
        <span className="flex w-full items-start justify-between gap-2">
          <span className="text-body-l-semibold text-gray-800">{region}</span>
          <span className="shrink-0 text-body-m-regular text-gray-400">{period}</span>
        </span>
        <span className="text-body-m-regular text-gray-700">{summary}</span>
      </button>

      {/* 펼침 콘텐츠 */}
      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="h-px w-full bg-gray-100" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1">
              <Sparkle className="size-[17px] shrink-0 text-key" />
              <span className="text-body-m-semibold text-key">AI가 핵심만 설명할게요</span>
            </div>
            <p className="text-[16px] leading-[1.6] font-normal tracking-normal whitespace-pre-line text-gray-700">
              {explanation}
            </p>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-body-m-medium text-gray-500">관련 태그</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-6 bg-gray-90 px-3 py-2 text-caption-l-regular text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
