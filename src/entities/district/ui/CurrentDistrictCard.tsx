import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

const GRADES = ['A', 'B', 'C', 'D', 'E'] as const
type Grade = (typeof GRADES)[number]

// 쇠퇴 등급 → 상태 (A 양호 · B 안정 · C 주의 · D 경계 · E 위험)
const GRADE_STATUS: Record<Grade, string> = {
  A: '양호',
  B: '안정',
  C: '주의',
  D: '경계',
  E: '위험',
}

type CurrentDistrictCardProps = {
  /** 제목 */
  question?: string
  /** 현재 등급 (A~E) */
  grade: Grade
  /** 상태 칩 (미지정 시 등급에서 유도) */
  status?: string
  /** 지난 분기 등급 (예: "B등급") */
  lastGrade?: string
  onViewLast?: () => void
  /** 우상단 가게 일러스트 (SVG 등) */
  illustration?: React.ReactNode
  className?: string
}

/**
 * 홈 현재 상권 히어로 카드 (Figma: Card_홈_현재상권 554:12983).
 * 제목 + 등급(큰 글자)·상태 칩 + A~E 게이지(현재까지 오렌지 fill·현재 위치 흰 링) + 지난 분기 등급 pill.
 * 우상단 가게 일러스트는 `illustration` 슬롯. 상태는 등급에서 유도(A 양호~E 위험).
 */
export function CurrentDistrictCard({
  question = '현재 나의 가게 상권은\n어떤 상태일까?',
  grade,
  status,
  lastGrade,
  onViewLast,
  illustration,
  className,
}: CurrentDistrictCardProps) {
  const currentIndex = GRADES.indexOf(grade)
  const fillPct = (currentIndex / (GRADES.length - 1)) * 100
  const statusLabel = status ?? GRADE_STATUS[grade]

  return (
    <div className={cn('relative w-full overflow-hidden rounded-16 bg-white p-5', className)}>
      {illustration && <div className="absolute top-[70px] right-4">{illustration}</div>}

      <p className="text-title-s-semibold whitespace-pre-line text-gray-900">{question}</p>

      {/* 등급 + 상태 칩 */}
      <div className="mt-5 flex items-center gap-2">
        <span className="flex items-center gap-0.5">
          <span className="text-[40px] leading-[1.4] font-semibold tracking-[-0.02em] text-gray-900">
            {grade}
          </span>
          <span className="text-[28px] leading-[1.4] font-semibold tracking-[-0.02em] text-gray-800">
            등급
          </span>
        </span>
        <span className="rounded-max bg-orange-50 px-3 py-1 text-body-l-medium text-orange-400">
          {statusLabel}
        </span>
      </div>

      {/* A~E 게이지 */}
      <div className="mt-8">
        <div className="relative h-2 w-full rounded-full bg-gray-200">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-key"
            style={{ width: `${fillPct}%` }}
          />
          {GRADES.map((g, i) => {
            const pos = (i / (GRADES.length - 1)) * 100
            const isCurrent = i === currentIndex
            const isPast = i < currentIndex
            return (
              <span
                key={g}
                className={cn(
                  'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  isCurrent
                    ? 'size-5 border-[3px] border-key bg-white'
                    : cn('size-3.5', isPast ? 'bg-key' : 'bg-gray-200'),
                )}
                style={{ left: `${pos}%` }}
              />
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-caption-l-medium text-gray-500">
          {GRADES.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </div>

      {/* 지난 분기 등급 pill */}
      {lastGrade && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onViewLast}
            className="flex items-center gap-1.5 rounded-max bg-info-blue-soft px-3 py-1 text-body-m-regular"
          >
            <span className="text-gray-500">지난 분기 등급</span>
            <span className="font-semibold text-info-blue">{lastGrade}</span>
            <ChevronRight aria-hidden className="size-3.5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  )
}
