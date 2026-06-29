import { cn } from '@/lib/cn'

/**
 * Recharts 공용 커스텀 툴팁.
 *
 * Recharts 가 런타임에 active/payload/label 을 주입하므로 모든 prop 은 optional.
 * 그래서 <ChartTooltip unit="명" /> 처럼 ReactElement 로 넘겨도 타입 에러가 안 난다.
 * (content={<ChartTooltip />} 형태가 Recharts 의 권장 커스텀 방식)
 */
type TooltipItem = {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

type ChartTooltipProps = {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
  /** 값 뒤에 붙는 단위 (예: '명', '점', '%') */
  unit?: string
  className?: string
}

export function ChartTooltip({ active, payload, label, unit, className }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm',
        className,
      )}
    >
      {label != null && <p className="mb-1 text-xs font-semibold text-gray-400">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((item, i) => (
          <li key={item.dataKey ?? item.name ?? i} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name && <span className="text-gray-500">{item.name}</span>}
            <span className="ml-auto font-bold tracking-tight text-gray-900 tabular-nums">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              {unit && <span className="ml-0.5 text-xs font-medium text-gray-400">{unit}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
