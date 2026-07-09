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

// 등급 바 세그먼트 색 (Figma "Home Card/01~05" 토큰) — A 밝은 주황 → E 진한 빨강(가장 진함)
const SEGMENT_COLORS: Record<Grade, string> = {
  A: 'bg-home-card-1',
  B: 'bg-home-card-2',
  C: 'bg-home-card-3',
  D: 'bg-home-card-4',
  E: 'bg-home-card-5',
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
 * 제목 + 등급(큰 글자)·상태 칩 + A~E 등급 바(현재 등급까지 색 채움·나머지 회색·현재 위 ▼ 포인터) + 지난 분기 등급 pill.
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

      {/* A~E 등급 바 — 5색 세그먼트 + 현재 등급 위 ▼ 포인터 (Figma: 1082:13181) */}
      <div className="mt-8">
        {/* ▼ 현재 등급 포인터 — 세그먼트와 동일한 5칸 그리드로 정렬 */}
        <div className="mb-1 flex gap-1">
          {GRADES.map((g, i) => (
            <div key={g} className="flex flex-1 justify-center">
              {i === currentIndex && (
                <span className="size-0 border-x-[8px] border-t-[10px] border-x-transparent border-t-gray-300" />
              )}
            </div>
          ))}
        </div>
        {/* 세그먼트 — 현재 등급까지만 색 채움(각 칸 고유색), 이후 칸은 gray-100 */}
        <div className="flex gap-1">
          {GRADES.map((g, i) => {
            const filled = i <= currentIndex
            return (
              <span
                key={g}
                className={cn(
                  'h-2.5 flex-1 rounded-full',
                  filled ? SEGMENT_COLORS[g] : 'bg-gray-100',
                )}
              />
            )
          })}
        </div>
        {/* A~E 라벨 */}
        <div className="mt-1.5 flex gap-1">
          {GRADES.map((g) => (
            <span key={g} className="flex-1 text-center text-caption-l-medium text-gray-500">
              {g}
            </span>
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
