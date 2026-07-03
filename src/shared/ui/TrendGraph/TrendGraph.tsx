import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/shared/lib/cn'

export type TrendPoint = { label: string; value: number }

type TrendGraphProps = {
  /** 제목 (예: "3년 추이") */
  title?: string
  data: TrendPoint[]
  /** y축 모드 — value(숫자) · grade(A~E) */
  variant?: 'value' | 'grade'
  /** 우상단 단위 (예: "(명)") */
  unit?: string
  /** 마지막 점 강조 라벨 (예: "134,302명"·"13%") — 없으면 표시 안 함 */
  highlightLabel?: string
  /** x축에 표시할 라벨 (미지정 시 전체) */
  xTicks?: string[]
  /** y축 값 포맷 (value 모드) */
  yFormatter?: (value: number) => string
  height?: number
  className?: string
}

// grade 모드: 5=A(최상) ~ 1=E(최하)
const GRADE_TICKS = [1, 2, 3, 4, 5]
const GRADE_LABEL: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E' }

const KEY = '#ff621b'
const GRID = '#e4e4e4'
const AXIS_TEXT = '#acacac'

// 마지막 점 위 다크 pill (Figma: Data point container)
function PillLabel(props: { viewBox?: { x?: number; y?: number }; text: string }) {
  const { viewBox, text } = props
  const x = viewBox?.x ?? 0
  const y = viewBox?.y ?? 0
  const w = text.length * 7.5 + 16
  return (
    <g>
      <rect x={x - w - 10} y={y - 12} width={w} height={24} rx={8} fill="#474747" />
      <text
        x={x - w / 2 - 10}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={500}
        fill="#fff"
      >
        {text}
      </text>
    </g>
  )
}

/**
 * 3년 추이 영역 차트 (Figma: 3years_Graph 353:9295). recharts 기반.
 * 오렌지 라인 + 그라데이션 fill + 점선 그리드 + 우측 y축(값/등급).
 * `highlightLabel` 지정 시 마지막 점에 마커·세로선·다크 pill 표시.
 */
export function TrendGraph({
  title,
  data,
  variant = 'value',
  unit,
  highlightLabel,
  xTicks,
  yFormatter,
  height = 150,
  className,
}: TrendGraphProps) {
  const grade = variant === 'grade'
  const last = data.at(-1)

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {title && <p className="text-body-l-semibold text-gray-600">{title}</p>}
      <div className="relative w-full" style={{ height }}>
        {unit && (
          <span className="absolute top-0 right-0 z-10 text-caption-l-medium text-gray-300">
            {unit}
          </span>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={KEY} stopOpacity={0.25} />
                <stop offset="100%" stopColor={KEY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              ticks={xTicks}
              tick={{ fontSize: 12, fill: AXIS_TEXT }}
            />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              width={30}
              tick={{ fontSize: 12, fill: AXIS_TEXT }}
              domain={grade ? [1, 5] : ['auto', 'auto']}
              ticks={grade ? GRADE_TICKS : undefined}
              tickFormatter={grade ? (v: number) => GRADE_LABEL[v] ?? '' : yFormatter}
            />
            <Area
              type={grade ? 'linear' : 'monotone'}
              dataKey="value"
              stroke={KEY}
              strokeWidth={2}
              fill="url(#trend-fill)"
              dot={false}
              isAnimationActive={false}
            />
            {highlightLabel && last && (
              <>
                <ReferenceLine x={last.label} stroke={GRID} strokeDasharray="4 4" />
                <ReferenceDot
                  x={last.label}
                  y={last.value}
                  r={4}
                  fill="#fff"
                  stroke={KEY}
                  strokeWidth={2}
                  label={<PillLabel text={highlightLabel} />}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
