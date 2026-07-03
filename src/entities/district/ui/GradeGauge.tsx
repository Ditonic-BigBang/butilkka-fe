import { cn } from '@/shared/lib/cn'

// 반원 게이지 지오메트리 (viewBox 216 x 116)
const CX = 108
const CY = 108
const RMID = 101 // 밴드 중심선 반지름 (바깥 반지름 ≈ 107, Figma 비율)
const T = 14 // 밴드 두께 (얇게)
const GAP = 2 // 세그먼트 사이 간격(각도)
const SEGLEN = (180 - 4 * GAP) / 5 // 균일 세그먼트 길이 (각도) — 5칸 균등 + 4간격
const MARK_R = 80 // 마커 반지름 (밴드 안쪽 여백)

const GRADES = ['A', 'B', 'C', 'D', 'E'] as const
// 쇠퇴 등급 → 채움 단계 (A 양호=1 … E 위험=5)
const GRADE_LEVEL: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 }

function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) }
}

// 좌(180°)→우(0°) 위로 도는 아크 path
function arcPath(fromDeg: number, toDeg: number) {
  const s = polar(fromDeg, RMID)
  const e = polar(toDeg, RMID)
  return `M ${s.x} ${s.y} A ${RMID} ${RMID} 0 0 1 ${e.x} ${e.y}`
}

// i번째 세그먼트(0=A 좌 … 4=E 우). 모두 균일 길이, 사이 간격 균일. 양끝은 180°/0° 도달
function segmentPath(i: number) {
  const from = 180 - i * (SEGLEN + GAP)
  return arcPath(from, from - SEGLEN)
}

type GradeGaugeProps = {
  /** 등급 문자 (예: "C") */
  grade: string
  /** 상태 (예: "주의") */
  status: string
  /** 채움 단계 1~5 (미지정 시 grade A~E 에서 유도) */
  level?: number
  className?: string
}

/**
 * 반원 등급 게이지 (Figma: Bottom Sheet Grade 424:12314).
 * 5개 세그먼트로 나뉜 반원(내부는 각지게, 바깥 양끝만 둥글게) — 현재 등급까지 오렌지, 나머지 회색.
 * 현재 등급 세그먼트 아래(밴드 밖 여백)에 삼각 마커 하나. 단계는 grade(A=1…E=5)에서 유도.
 */
export function GradeGauge({ grade, status, level, className }: GradeGaugeProps) {
  const lv = Math.min(Math.max(level ?? GRADE_LEVEL[grade] ?? 5, 1), 5)
  const markAngle = 180 - (lv - 1) * (SEGLEN + GAP) - SEGLEN / 2 // 현재 세그먼트 중심
  const mark = polar(markAngle, MARK_R)
  const markRot = (Math.atan2(mark.y - CY, mark.x - CX) * 180) / Math.PI - 90

  const left = polar(180, RMID)
  const right = polar(0, RMID)
  const rightColor = lv >= 5 ? 'url(#grade-gauge)' : '#e4e4e4'

  return (
    <div className={cn('relative inline-flex w-[216px]', className)}>
      <svg viewBox="0 0 216 116" className="w-full" aria-hidden>
        <defs>
          <linearGradient
            id="grade-gauge"
            gradientUnits="userSpaceOnUse"
            x1="2"
            y1="0"
            x2="214"
            y2="0"
          >
            <stop offset="0%" stopColor="#ffc78a" />
            <stop offset="100%" stopColor="#ff9058" />
          </linearGradient>
        </defs>
        {/* 세그먼트 밴드 (각진 끝) — 현재 등급까지 오렌지, 나머지 회색 */}
        {GRADES.map((g, i) => (
          <path
            key={g}
            d={segmentPath(i)}
            fill="none"
            stroke={i < lv ? 'url(#grade-gauge)' : '#e4e4e4'}
            strokeWidth={T}
            strokeLinecap="butt"
          />
        ))}
        {/* 바깥 양끝만 둥글게 */}
        <circle cx={left.x} cy={left.y} r={T / 2} fill="url(#grade-gauge)" />
        <circle cx={right.x} cy={right.y} r={T / 2} fill={rightColor} />
        {/* 현재 등급 마커 (밴드 밖, 세그먼트 향해) */}
        <polygon
          points="-4.5,-4 4.5,-4 0,5"
          fill="#ffc7a8"
          transform={`translate(${mark.x} ${mark.y}) rotate(${markRot})`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-[16%] flex items-center justify-center gap-1">
        <span className="text-[40px] leading-none font-medium tracking-[-0.02em] text-gray-900">
          {grade}
        </span>
        <span className="text-[20px] leading-none font-semibold tracking-[-0.02em] text-gray-900">
          {status}
        </span>
      </div>
    </div>
  )
}
