import { ChangeIndicator } from '@/shared/ui/ChangeIndicator/ChangeIndicator'
import { cn } from '@/shared/lib/cn'

type Direction = 'up' | 'down'

export type SparkPoint = { label: string; value: number }

// 스파크라인 지오메트리 (viewBox 140 x 70)
const W = 140
const PLOT_TOP = 6 // 상단 여백 (링 점 잘림 방지)
const PLOT_BOTTOM = 40 // 데이터 라인 하한
const GUIDE_BOTTOM = 48 // 세로 가이드선 하단 (라벨 위)
const LABEL_Y = 66 // x축 라벨 베이스라인
const X_POS = [10, 64, 119] // 3포인트 x 좌표 (Figma 비율)

// 3포인트 미니 라인 차트 — 각 포인트 아래 세로 가이드선 + 라벨, 마지막 점 흰 링
function Sparkline({ data }: { data: SparkPoint[] }) {
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const points = data.map((d, i) => ({
    x: X_POS[i] ?? W - 10,
    y:
      range === 0
        ? (PLOT_TOP + PLOT_BOTTOM) / 2
        : PLOT_TOP + ((max - d.value) / range) * (PLOT_BOTTOM - PLOT_TOP),
    label: d.label,
  }))
  const last = points.at(-1)

  return (
    <svg viewBox={`0 0 ${W} 70`} preserveAspectRatio="none" className="h-[70px] w-full" aria-hidden>
      {/* 세로 가이드선 (포인트 → 라벨 위, 점선 — Figma dasharray 3 1.5) */}
      {points.map((p) => (
        <line
          key={p.label}
          x1={p.x}
          y1={p.y}
          x2={p.x}
          y2={GUIDE_BOTTOM}
          stroke="#e4e4e4"
          strokeWidth={1}
          strokeDasharray="3 1.5"
        />
      ))}
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#ff621b"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {last && (
        <circle cx={last.x} cy={last.y} r={4.5} fill="#fff" stroke="#ff621b" strokeWidth={2} />
      )}
      {/* x축 라벨 */}
      {points.map((p) => (
        <text key={p.label} x={p.x} y={LABEL_Y} textAnchor="middle" fontSize={12} fill="#adadad">
          {p.label}
        </text>
      ))}
    </svg>
  )
}

type MetricTrendCardProps = {
  /** 지표명 (예: "유동인구"·"폐업률") */
  title: string
  /** 큰 값 (예: "-18%") */
  value: string
  /** 증감 칩 — up(▲빨강/soft red)·down(▼파랑/soft blue) + 텍스트 (예: "1,215명") */
  change?: { direction: Direction; label: string }
  /** 추이 3포인트 (예: 4월·5월·이번 달) */
  trend: SparkPoint[]
  /** vertical(반폭 카드) · horizontal(전폭, 차트 우측) */
  layout?: 'vertical' | 'horizontal'
  className?: string
}

const CHIP_BG: Record<Direction, string> = {
  up: 'bg-status-red-soft',
  down: 'bg-info-blue-soft',
}
const CHIP_TEXT: Record<Direction, string> = {
  up: 'text-status-red',
  down: 'text-info-blue',
}

/**
 * 홈 지표 추이 카드 (Figma: Home_Graph 585:11060 · Home_Graph_폐업률 585:11172).
 * 제목 + 큰 값 + 증감 칩 + 3포인트 스파크라인(보기 전용, 인터랙션 없음).
 * - `vertical`: 반폭 카드, 차트가 아래 (유동인구·점포수)
 * - `horizontal`: 전폭 카드, 차트가 우측 (폐업률)
 */
export function MetricTrendCard({
  title,
  value,
  change,
  trend,
  layout = 'vertical',
  className,
}: MetricTrendCardProps) {
  const horizontal = layout === 'horizontal'

  const header = (
    <div className={cn('flex flex-col', horizontal ? 'gap-5' : 'gap-2')}>
      <p className="text-body-l-medium text-gray-700">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-[28px] leading-[1.4] font-semibold tracking-[-0.02em] text-gray-900">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-4 px-1.5 py-0.5 whitespace-nowrap',
              CHIP_BG[change.direction],
            )}
          >
            {/* Figma 칩 삼각형은 9x8 — ChangeIndicator(12x10) svg 만 축소 */}
            <ChangeIndicator direction={change.direction} className="[&>svg]:h-2 [&>svg]:w-[9px]" />
            <span className={cn('text-caption-l-medium', CHIP_TEXT[change.direction])}>
              {change.label}
            </span>
          </span>
        )}
      </div>
    </div>
  )

  if (horizontal) {
    return (
      <div
        className={cn(
          'flex w-full items-end justify-between gap-4 rounded-12 bg-white p-4',
          className,
        )}
      >
        {header}
        <div className="w-[145px] shrink-0">
          <Sparkline data={trend} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex w-full flex-col gap-5 rounded-12 bg-white p-4', className)}>
      {header}
      <Sparkline data={trend} />
    </div>
  )
}
