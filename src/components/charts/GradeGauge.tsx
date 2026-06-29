import { PieChart, Pie, ResponsiveContainer } from 'recharts'
import { ColoredSlice } from '@/components/charts/ChartShapes'
import { cn } from '@/lib/cn'

/* ────────────────────────────────────────────────────────────
   반원 등급 게이지 — Figma '이번 분기' 변환.

   Recharts 반-도넛(PieChart, startAngle 180° → endAngle 0°) 으로 호를 그리고
   등급 수만큼 균등 세그먼트 + paddingAngle(간격) + cornerRadius(둥근 끝) 로
   Figma 의 분절된 게이지를 재현한다. 현재 등급 마커와 중앙 라벨은
   원 중심(left:50%)을 기준으로 극좌표 계산해 오버레이한다.
   → 컨테이너 폭이 바뀌어도 가로 중심(50%)은 고정이라 마커 위치가 안 깨진다.

   Figma 는 와이어프레임(회색)이라, 색은 브랜드 의미색으로 커스텀:
   A(좋음)=emerald → B=sky → C=amber → D(나쁨)=rose 의 품질 스케일.
   등급 배열은 왼→오 순서, 기본은 A(최상)~D(최하).
──────────────────────────────────────────────────────────── */

type GradeGaugeProps = {
  /** 현재 등급 (grades 안의 값) */
  value: string
  /** 왼→오 등급 라벨. 기본 ['A','B','C','D'] */
  grades?: string[]
  /** 게이지 영역 높이(px) */
  height?: number
  className?: string
}

// 등급 품질 스케일 (좋음 → 나쁨)
const GRADE_COLORS: Record<string, string> = {
  A: '#10b981', // emerald
  B: '#0ea5e9', // sky
  C: '#f59e0b', // amber
  D: '#f43f5e', // rose
}
const FALLBACK_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e']
const gradeColor = (g: string, i: number) =>
  GRADE_COLORS[g] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]

// 반원 기하 (Figma: 호 폭 ≈ 184px → 반지름 92px)
const OUTER_R = 92
const INNER_R = 68
const MARKER_R = OUTER_R - 3 // 마커는 호 바깥 가장자리 근처

export function GradeGauge({
  value,
  grades = ['A', 'B', 'C', 'D'],
  height = 132,
  className,
}: GradeGaugeProps) {
  const n = grades.length
  const activeIdx = Math.max(0, grades.indexOf(value))
  const activeColor = gradeColor(value, activeIdx)

  // 균등 세그먼트 (값 동일 → 각도 균등). 현재 등급만 진하게, 나머지는 흐리게.
  const segments = grades.map((g, i) => ({
    name: g,
    value: 1,
    color: gradeColor(g, i) + (i === activeIdx ? 'ff' : '40'),
  }))

  // 원 중심(축)을 바닥 살짝 위에 둬서 위쪽 반원만 보이게
  const cy = height - 16

  // 현재 등급 세그먼트의 중심 각(수학각, +x축 기준 반시계 / 도)
  const step = 180 / n
  const theta = (180 - (activeIdx + 0.5) * step) * (Math.PI / 180)
  const mx = MARKER_R * Math.cos(theta) // +오른쪽
  const my = MARKER_R * Math.sin(theta) // +위
  // ▼(아래 향한 삼각형)을 중심 쪽으로 돌리는 회전각
  const markerRot = (Math.atan2(mx, my) * 180) / Math.PI

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={segments}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy={cy}
            innerRadius={INNER_R}
            outerRadius={OUTER_R}
            paddingAngle={4}
            cornerRadius={8}
            stroke="none"
            isAnimationActive={false}
            shape={ColoredSlice}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 현재 등급 마커 — 호 위 현재 등급 위치에서 중심을 향하는 흰 삼각형(어떤 색 위에서도 또렷) */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: '50%',
          top: cy - my,
          transform: `translate(calc(${mx}px - 50%), -50%) rotate(${markerRot}deg)`,
          filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.25))',
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '8px solid #ffffff',
          }}
        />
      </div>

      {/* 중앙 등급 라벨 (C 등급) */}
      <div
        className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-end gap-1"
        style={{ top: cy - 56 }}
      >
        <span
          className="text-5xl leading-none font-bold tracking-tight"
          style={{ color: activeColor }}
        >
          {value}
        </span>
        <span className="pb-1.5 text-xl leading-none font-semibold text-[#676767]">등급</span>
      </div>
    </div>
  )
}
