import { cn } from '@/shared/lib/cn'

// 반원 게이지 지오메트리 (viewBox 216 x 116)
const CX = 108
const CY = 104
const RMID = 90 // 아크 중심선 반지름
const T = 20 // 밴드 두께
const TICK_ANGLES = [18, 54, 90, 126, 162] // 세그먼트 중심 (5등급)

const ARC = `M ${CX - RMID} ${CY} A ${RMID} ${RMID} 0 0 1 ${CX + RMID} ${CY}`

function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) }
}

type GradeGaugeProps = {
  /** 등급 문자 (예: "C") */
  grade: string
  /** 상태 (예: "주의") */
  status: string
  className?: string
}

/**
 * 반원 등급 게이지 (Figma: Bottom Sheet Grade 424:12314).
 * 오렌지 그라데이션 반원 밴드 + 방사형 삼각 눈금(흰 컷아웃) + 중앙 등급·상태.
 */
export function GradeGauge({ grade, status, className }: GradeGaugeProps) {
  return (
    <div className={cn('relative inline-flex w-[216px]', className)}>
      <svg viewBox="0 0 216 116" className="w-full" aria-hidden>
        <defs>
          <linearGradient id="grade-gauge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffc78a" />
            <stop offset="100%" stopColor="#ff9058" />
          </linearGradient>
        </defs>
        <path
          d={ARC}
          fill="none"
          stroke="url(#grade-gauge)"
          strokeWidth={T}
          strokeLinecap="round"
        />
        {TICK_ANGLES.map((deg) => {
          const p = polar(deg, RMID)
          const rot = (Math.atan2(CY - p.y, CX - p.x) * 180) / Math.PI - 90
          return (
            <polygon
              key={deg}
              points="-4,-4 4,-4 0,4"
              fill="#fff"
              transform={`translate(${p.x} ${p.y}) rotate(${rot})`}
            />
          )
        })}
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
