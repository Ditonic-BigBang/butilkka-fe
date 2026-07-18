import { useState } from 'react'
import ChevronDown from '~icons/ci/chevron-down'
import { ChangeIndicator } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type Stat = {
  /** 지표명 (예: "점포수") */
  label: string
  /** 값 (예: "-4개") */
  value: string
  /** 증감 방향 — 화살표 색(▲빨강/▼파랑) */
  direction: 'up' | 'down' | 'same'
  /** 화살표 옆 텍스트 (예: "감소"·"명/일"·"증가") */
  change: string
}

// 안정 참조(기본값 재생성 방지)
const NO_STATS: Stat[] = []

type RankedDistrictCardProps = {
  /** 순위 */
  rank: number
  name: string
  description: string
  /** 펼침 시 스탯 타일 (점포수·유동인구·공실 등) */
  stats?: Stat[]
  /** 기준일 (예: "26.03 기준") */
  referenceDate?: string
  onViewMap?: () => void
  /** 펼침 제어 (미지정 시 내부 토글) */
  expanded?: boolean
  defaultExpanded?: boolean
  onToggle?: (expanded: boolean) => void
  /** 보기 전용(PDF 등 정적 문서용) — 항상 펼침 고정, 토글 화살표·하단 액션 버튼 숨김 */
  readOnly?: boolean
  className?: string
}

/**
 * 순위 지역 드롭다운 카드 (Figma: Dropdown_L 267:5750).
 * 접힘: 순위 뱃지 + 지역명 + 설명 + 펼침 화살표. 헤더 탭 → 펼침.
 * 펼침: 스탯 타일(값 + ChangeIndicator 화살표) + 기준일 + [접기 · 지도에서 확인하기].
 * 펼침/접힘은 grid-rows 전환으로 부드럽게 — 닫힌 콘텐츠는 inert 로 포커스·조작 차단.
 */
export function RankedDistrictCard({
  rank,
  name,
  description,
  stats = NO_STATS,
  referenceDate,
  onViewMap,
  expanded,
  defaultExpanded = false,
  onToggle,
  readOnly = false,
  className,
}: RankedDistrictCardProps) {
  const [internal, setInternal] = useState(defaultExpanded)
  const open = readOnly || (expanded ?? internal)

  const toggle = () => {
    if (expanded === undefined) setInternal(!open)
    onToggle?.(!open)
  }

  return (
    <div
      className={cn(
        'w-full bg-white p-4 transition-transform duration-150 has-[:active]:scale-[0.99]',
        open ? 'rounded-14' : 'rounded-12',
        className,
      )}
    >
      {/* 헤더 (탭 → 펼침 토글) */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-8 bg-gray-70 text-body-m-semibold text-gray-600">
          {rank}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body-l-semibold text-gray-900">{name}</span>
          <span className="text-body-m-regular text-gray-700">{description}</span>
        </span>
        {!readOnly && (
          <ChevronDown
            aria-hidden
            className={cn(
              'size-6 shrink-0 text-gray-400 transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      {/* 펼침 콘텐츠 — grid-rows 0fr→1fr 높이 전환 (닫힘 = invisible·inert) */}
      <div
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out motion-reduce:transition-none',
          open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 pt-4">
            {stats.length > 0 && (
              <div className="flex gap-2.5">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-1 flex-col gap-3 rounded-8 bg-gray-70 p-3"
                  >
                    <span className="text-body-m-regular text-gray-400">{s.label}</span>
                    <span className="flex flex-col gap-1">
                      <span className="text-body-l-semibold text-gray-900">{s.value}</span>
                      <span className="flex items-center gap-1">
                        <ChangeIndicator direction={s.direction} />
                        <span className="text-caption-l-regular text-gray-500">{s.change}</span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {referenceDate && (
              <span className="text-caption-l-regular text-gray-300">{referenceDate}</span>
            )}

            {!readOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggle}
                  className="w-[128px] shrink-0 rounded-8 border border-gray-100 px-4 py-3 text-body-m-semibold text-gray-900 transition-colors active:bg-gray-70"
                >
                  접기
                </button>
                <button
                  type="button"
                  onClick={onViewMap}
                  className="flex-1 rounded-8 bg-key px-4 py-3 text-body-m-semibold text-white transition-colors active:bg-orange-600"
                >
                  지도에서 확인하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
