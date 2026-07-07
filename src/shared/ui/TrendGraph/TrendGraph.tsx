import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
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
  /** 포인트 pill 텍스트 — 지정 시 차트 탭으로 포인트 선택(세로선·점·pill). 탭 전엔 표시 없음 */
  tooltipFormatter?: (point: TrendPoint) => string
  /** 초기 선택 인덱스 (기본: 선택 없음) */
  defaultActiveIndex?: number
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
const Y_AXIS_WIDTH = 30
const RIGHT_MARGIN = 8
const PERCENT_TICK_COUNT = 4 // 3칸
const DEFAULT_TICK_COUNT = 5 // 4칸

function getValueDomain(data: TrendPoint[]): [number, number] {
  if (data.length === 0) return [0, 1]

  const values = data.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min !== max) return [min, max]

  const padding = Math.max(Math.abs(min) * 0.1, 1)
  return [min - padding, max + padding]
}

function getUniformTicks([min, max]: [number, number], count: number) {
  return Array.from({ length: count }, (_, index) => min + ((max - min) / (count - 1)) * index)
}

function getUniformGridCoordinates(
  { top, height }: { top: number; height: number },
  count: number,
) {
  if (count <= 1) return [top]
  return Array.from({ length: count }, (_, index) => top + (height / (count - 1)) * index)
}

function hasPercentUnit(value: string | undefined) {
  return value?.includes('%') ?? false
}

// 선택 포인트 위 다크 pill (Figma: Data point container) — 점 위로 띄워서 표시
function PillLabel(props: {
  viewBox?: { x?: number; y?: number }
  text: string
  align: 'left' | 'center' | 'right'
}) {
  const { viewBox, text, align } = props
  const x = viewBox?.x ?? 0
  const y = viewBox?.y ?? 0
  const w = text.length * 7.5 + 16
  const rectX = Math.max(2, align === 'right' ? x - w + 8 : align === 'left' ? x - 8 : x - w / 2)
  const rectY = Math.max(2, y - 36) // 점 위 12px 간격 (pill 높이 24)
  return (
    <g>
      <rect x={rectX} y={rectY} width={w} height={24} rx={8} fill="#474747" />
      <text
        x={rectX + w / 2}
        y={rectY + 13}
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
 * `tooltipFormatter` 지정 시 차트 탭으로 포인트 선택 — 선택 전엔 아무 표시 없고,
 * 탭하면 해당 포인트에 세로 점선·흰 점·pill(점 위)이 표시된다. 다른 곳을 탭하면 이동.
 */
export function TrendGraph({
  title,
  data,
  variant = 'value',
  unit,
  tooltipFormatter,
  defaultActiveIndex,
  xTicks,
  yFormatter,
  height = 150,
  className,
}: TrendGraphProps) {
  const grade = variant === 'grade'
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex ?? null)
  const samplePoint = data[0]
  const percent =
    !grade &&
    (hasPercentUnit(unit) ||
      (samplePoint != null && hasPercentUnit(tooltipFormatter?.(samplePoint))) ||
      (samplePoint != null && hasPercentUnit(yFormatter?.(samplePoint.value))))
  const tickCount = percent ? PERCENT_TICK_COUNT : DEFAULT_TICK_COUNT
  const valueDomain = getValueDomain(data)
  const yTicks = grade ? GRADE_TICKS : getUniformTicks(valueDomain, tickCount)
  const horizontalGridCoordinates = ({ offset }: { offset: { top: number; height: number } }) =>
    getUniformGridCoordinates(offset, yTicks.length)

  const interactive = Boolean(tooltipFormatter)
  const active = tooltipFormatter && activeIndex != null ? data[activeIndex] : undefined
  const pillText = active && tooltipFormatter ? tooltipFormatter(active) : null
  // pill 은 점 위 가운데 정렬 — 맨 첫/마지막 포인트만 잘림 방지로 좌/우 정렬
  const pillAlign =
    activeIndex === data.length - 1 ? 'right' : activeIndex === 0 ? 'left' : 'center'

  // 탭 x 좌표 → 가장 가까운 포인트 (포인트는 플롯 영역에 균등 분포)
  const handleClick = interactive
    ? (_: MouseHandlerDataParam, e: ReactMouseEvent<SVGGraphicsElement>) => {
        if (data.length < 2) return
        const rect = e.currentTarget.getBoundingClientRect()
        const plotWidth = rect.width - Y_AXIS_WIDTH - RIGHT_MARGIN
        if (plotWidth <= 0) return
        const ratio = (e.clientX - rect.left) / plotWidth
        const idx = Math.round(ratio * (data.length - 1))
        setActiveIndex(Math.min(Math.max(idx, 0), data.length - 1))
      }
    : undefined

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {title && <p className="text-body-l-semibold text-gray-600">{title}</p>}
      <div className={cn('relative w-full', interactive && 'cursor-pointer')} style={{ height }}>
        {unit && (
          <span className="absolute top-0 right-[18px] z-10 translate-x-1/2 text-caption-l-medium text-gray-300">
            {unit}
          </span>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 28, right: 8, bottom: 0, left: 0 }}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={KEY} stopOpacity={0.25} />
                <stop offset="100%" stopColor={KEY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke={GRID}
              strokeDasharray="2 3"
              horizontalCoordinatesGenerator={horizontalGridCoordinates}
            />
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
              domain={grade ? [1, 5] : valueDomain}
              ticks={yTicks}
              tickFormatter={grade ? (v: number) => GRADE_LABEL[v] ?? '' : yFormatter}
            />
            <Area
              type="linear"
              dataKey="value"
              stroke={KEY}
              strokeWidth={2}
              strokeLinecap="round"
              fill="url(#trend-fill)"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            {active && pillText && (
              <>
                <ReferenceLine x={active.label} stroke={GRID} strokeWidth={1} />
                <ReferenceDot
                  x={active.label}
                  y={active.value}
                  r={4}
                  fill="#fff"
                  stroke={KEY}
                  strokeWidth={2}
                  label={<PillLabel text={pillText} align={pillAlign} />}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
