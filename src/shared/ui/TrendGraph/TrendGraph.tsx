import { useEffect, useMemo, useRef, useState } from 'react'
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

export type TrendGraphProps = {
  /** 제목 (예: "3년 추이") */
  title?: string
  data: TrendPoint[]
  /** y축 모드 — value(숫자) · grade(A~E) */
  variant?: 'value' | 'grade'
  /** 우상단 단위 (예: "(명)") */
  unit?: string
  /** 포인트 pill 텍스트 — 지정 시 차트 탭으로 포인트 선택. grade 모드는 미지정해도 등급 pill 제공 */
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

function formatGradeTooltip(point: TrendPoint) {
  const label = GRADE_LABEL[point.value]
  return label ? `${label}등급` : String(point.value)
}

const KEY = 'var(--color-key)'
const GRID = 'var(--color-gray-100)'
const AXIS_TEXT = 'var(--color-gray-300)'
const MIN_Y_AXIS_WIDTH = 32
const Y_AXIS_LABEL_GAP = 8
const Y_AXIS_RIGHT_INSET = 4
const LEFT_MARGIN = 8
const RIGHT_MARGIN = 9
const VALUE_INTERVAL_COUNT = 4
const NICE_STEP_MULTIPLIERS = [1, 2, 2.5, 4, 5, 10]

// 12px 축 폰트의 글자별 최대 폭을 넉넉히 잡아 iOS/Android 폰트 차이에서도 잘리지 않게 한다.
function estimateTickLabelWidth(label: string) {
  return [...label].reduce((width, character) => {
    if (/\d/.test(character)) return width + 8
    if (/[.,-]/.test(character)) return width + 5
    return width + 12
  }, 0)
}

function getYAxisWidth(labels: string[]) {
  const labelWidth = Math.max(0, ...labels.map(estimateTickLabelWidth))
  return Math.max(MIN_Y_AXIS_WIDTH, Math.ceil(labelWidth + Y_AXIS_LABEL_GAP + Y_AXIS_RIGHT_INSET))
}

function getNiceStep(minimumStep: number) {
  const magnitude = 10 ** Math.floor(Math.log10(minimumStep))
  const normalizedStep = minimumStep / magnitude
  const multiplier = NICE_STEP_MULTIPLIERS.find((candidate) => candidate >= normalizedStep) ?? 10
  return multiplier * magnitude
}

function nextNiceStep(step: number) {
  return getNiceStep(step * (1 + Number.EPSILON * 4))
}

function normalizeScaleValue(value: number) {
  return Number(value.toPrecision(12))
}

/** 수치 그래프는 데이터 범위 주변에서 깔끔한 4구간 눈금을 만들어 변화를 선명하게 보여준다. */
function getValueScale(data: TrendPoint[]) {
  const values = data.map((point) => point.value).filter(Number.isFinite)
  if (values.length === 0) {
    return { domain: [0, 4] as [number, number], ticks: [0, 1, 2, 3, 4] }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  let step =
    min === max
      ? getNiceStep(Math.max(Math.abs(max) * 0.1, 1) / 2)
      : getNiceStep((max - min) / VALUE_INTERVAL_COUNT)
  let lower = Math.floor(min / step) * step

  // 정렬된 4구간 안에 최솟값·최댓값이 모두 들어오지 않으면 다음 깔끔한 간격으로 넓힌다.
  while (lower + step * VALUE_INTERVAL_COUNT < max) {
    step = nextNiceStep(step)
    lower = Math.floor(min / step) * step
  }

  if (min === max) lower = Math.floor(min / step) * step - step * 2
  const ticks = Array.from({ length: VALUE_INTERVAL_COUNT + 1 }, (_, index) =>
    normalizeScaleValue(lower + step * index),
  )

  return { domain: [ticks[0], ticks.at(-1) ?? lower + step * 4] as [number, number], ticks }
}

function getUniformGridCoordinates(
  { top, height }: { top: number; height: number },
  count: number,
) {
  if (count <= 1) return [top]
  return Array.from({ length: count }, (_, index) => top + (height / (count - 1)) * index)
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
      <rect x={rectX} y={rectY} width={w} height={24} rx={8} fill="var(--color-gray-700)" />
      <text
        x={rectX + w / 2}
        y={rectY + 13}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={500}
        fill="white"
      >
        {text}
      </text>
    </g>
  )
}

/**
 * 3년 추이 영역 차트 (Figma: 3years_Graph 353:9295). recharts 기반.
 * 오렌지 라인 + 그라데이션 fill + 점선 그리드 + 우측 y축(값/등급).
 * `tooltipFormatter` 지정 시(grade 모드는 기본 제공) 차트 탭으로 포인트 선택 — 선택 전엔 아무 표시 없고,
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
  const touchTargetRef = useRef<HTMLDivElement>(null)
  const resolvedTooltipFormatter = tooltipFormatter ?? (grade ? formatGradeTooltip : undefined)
  const valueScale = useMemo(() => getValueScale(data), [data])
  const valueDomain = valueScale.domain
  const yTicks = grade ? GRADE_TICKS : valueScale.ticks
  const formatYTick = (value: number) =>
    grade ? (GRADE_LABEL[value] ?? '') : (yFormatter?.(value) ?? String(value))
  const yAxisWidth = getYAxisWidth(yTicks.map(formatYTick))
  const horizontalGridCoordinates = ({ offset }: { offset: { top: number; height: number } }) =>
    getUniformGridCoordinates(offset, yTicks.length)

  const interactive = Boolean(resolvedTooltipFormatter)
  const active = resolvedTooltipFormatter && activeIndex != null ? data[activeIndex] : undefined
  const pillText = active && resolvedTooltipFormatter ? resolvedTooltipFormatter(active) : null
  // pill 은 점 위 가운데 정렬 — 맨 첫/마지막 포인트만 잘림 방지로 좌/우 정렬
  const pillAlign =
    activeIndex === data.length - 1 ? 'right' : activeIndex === 0 ? 'left' : 'center'

  // 탭 x 좌표 → 가장 가까운 포인트 (포인트는 플롯 영역에 균등 분포).
  // 비포커스 div 에 네이티브 리스너를 붙여 SVG/버튼처럼 모바일 포커스 대상이 되지 않게 한다.
  useEffect(() => {
    const target = touchTargetRef.current
    if (!interactive || !target) return

    const handleTap = (e: MouseEvent) => {
      if (data.length < 2) return
      const rect = target.getBoundingClientRect()
      const plotWidth = rect.width - LEFT_MARGIN - yAxisWidth - RIGHT_MARGIN
      if (plotWidth <= 0) return
      const ratio = (e.clientX - rect.left - LEFT_MARGIN) / plotWidth
      const idx = Math.round(ratio * (data.length - 1))
      setActiveIndex(Math.min(Math.max(idx, 0), data.length - 1))
    }

    target.addEventListener('click', handleTap)
    return () => target.removeEventListener('click', handleTap)
  }, [data.length, interactive, yAxisWidth])

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {title && <p className="text-body-l-semibold text-gray-600">{title}</p>}
      <div
        ref={touchTargetRef}
        className={cn(
          'relative w-full outline-none select-none [&_.recharts-surface]:outline-none',
          interactive && 'cursor-pointer touch-manipulation',
        )}
        style={{ height, outline: 'none', WebkitTapHighlightColor: 'transparent' }}
        data-testid="trend-graph-touch-target"
      >
        {unit && (
          <span
            className="absolute top-0 z-10 text-right text-caption-l-medium text-gray-300"
            style={{ right: RIGHT_MARGIN + Y_AXIS_RIGHT_INSET }}
          >
            {unit}
          </span>
        )}
        {/*
          모바일 터치 이벤트는 위의 비포커스 div 가 처리한다.
          SVG 를 직접 이벤트 대상으로 만들면 iOS Safari/Android Chrome 에서 포커스 사각형이 남을 수 있다.
        */}
        <ResponsiveContainer width="100%" height="100%" className="pointer-events-none">
          <AreaChart
            data={data}
            margin={{ top: 28, right: RIGHT_MARGIN, bottom: 0, left: LEFT_MARGIN }}
            accessibilityLayer={false}
            style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
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
              interval={0}
              minTickGap={0}
              width={yAxisWidth}
              tickSize={0}
              tickMargin={0}
              tick={{
                dx: yAxisWidth - Y_AXIS_RIGHT_INSET,
                fontSize: 12,
                fill: AXIS_TEXT,
                textAnchor: 'end',
              }}
              domain={grade ? [1, 5] : valueDomain}
              ticks={yTicks}
              tickFormatter={formatYTick}
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
                  fill="white"
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
