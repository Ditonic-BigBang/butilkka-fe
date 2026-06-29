import { ResponsiveContainer, AreaChart, Area, YAxis, CartesianGrid } from 'recharts'

/* ────────────────────────────────────────────────────────────
   '3년 추이' 변환 — 등급(A~D) Y축 + 그라데이션 영역 차트.

   등급을 숫자 척도로 매핑(A=4 위 … D=1 아래)해 YAxis 에 올리고,
   tickFormatter 로 다시 A~D 라벨로 되돌린다. 그리드는 4개 등급선만.
   색은 Figma 와이어프레임(회색) 대신 브랜드 indigo 로 커스텀.
──────────────────────────────────────────────────────────── */

type GradePoint = { t: number; grade: number }

const LINE = '#6366f1' // indigo
const GRADE_TICKS = [4, 3, 2, 1]
const GRADE_LABEL: Record<number, string> = { 4: 'A', 3: 'B', 2: 'C', 1: 'D' }
const gradeLabel = (v: number) => GRADE_LABEL[Math.round(v)] ?? ''

// 3년치 분기 추이(목업) — A/B 권에서 시작해 C 권으로 하락
const DEFAULT_DATA: GradePoint[] = [
  3.7, 3.8, 3.5, 3.6, 3.3, 3.4, 3.1, 2.9, 3.0, 2.7, 2.5, 2.6, 2.3, 2.1,
].map((grade, t) => ({ t, grade }))

type GradeTrendProps = {
  data?: GradePoint[]
  height?: number
}

export function GradeTrend({ data = DEFAULT_DATA, height = 150 }: GradeTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="gradeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE} stopOpacity={0.28} />
            <stop offset="100%" stopColor={LINE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#ededed" />
        <YAxis
          orientation="right"
          domain={[1, 4]}
          ticks={GRADE_TICKS}
          tickFormatter={gradeLabel}
          tick={{ fontSize: 12, fill: '#acacac' }}
          tickLine={false}
          axisLine={false}
          width={22}
        />
        <Area
          type="linear"
          dataKey="grade"
          name="등급"
          stroke={LINE}
          strokeWidth={2.5}
          fill="url(#gradeArea)"
          baseValue={1}
          isAnimationActive={false}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
