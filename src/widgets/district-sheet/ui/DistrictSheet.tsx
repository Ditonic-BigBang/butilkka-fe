import { useState } from 'react'
import { DistrictRankRow, GradeGauge } from '@/entities/district'
import { BottomSheet, ChangeIndicator, TrendGraph, type TrendPoint } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type Direction = 'up' | 'down' | 'same'

type RankItem = { rank: number; name: string; grade: string; direction?: Direction }
type AveragePeriod = { label: string; years: string }
type Comparison = { label: string; percent: string; direction: Direction }

type RankingContent = {
  type: 'ranking'
  /** 세그먼트 탭 라벨 (예: ["위험 높은 순", "안전한 순"]) */
  tabs?: string[]
  ranking: RankItem[]
  averagePeriod?: AveragePeriod
}
type GradeContent = {
  type: 'grade'
  quarter: string
  grade: string
  status: string
  lastGrade?: string
  trend: TrendPoint[]
  trendTicks?: string[]
}
type MetricContent = {
  type: 'metric'
  quarter: string
  value: string
  unit: string
  comparison?: Comparison
  trend: TrendPoint[]
  trendTicks?: string[]
  trendUnit?: string
  highlightLabel?: string
  yFormatter?: (value: number) => string
  averagePeriod?: AveragePeriod
}
type SheetContent = RankingContent | GradeContent | MetricContent

type DistrictSheetProps = {
  open: boolean
  onClose?: () => void
  title: string
  subtitle: string
  content: SheetContent
}

const CHANGE_BG: Record<Direction, string> = {
  up: 'bg-status-red-soft',
  down: 'bg-info-blue-soft',
  same: 'bg-gray-70',
}
const CHANGE_TEXT: Record<Direction, string> = {
  up: 'text-status-red',
  down: 'text-info-blue',
  same: 'text-gray-500',
}

function SectionDivider() {
  return <div className="h-2 w-full bg-gray-70" />
}

function PeriodSection({ label, years }: AveragePeriod) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <p className="text-body-l-semibold text-gray-800">평균 영업 기간</p>
      <div className="flex items-center justify-between">
        <span className="text-body-m-medium text-gray-900">{label}</span>
        <span className="flex items-baseline gap-0.5">
          <span className="text-title-s-semibold text-key">{years}</span>
          <span className="text-body-l-regular text-gray-700">년</span>
        </span>
      </div>
    </div>
  )
}

function SegmentedTabs({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="flex gap-1 rounded-12 bg-gray-70 p-1.5">
      {tabs.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => setActive(i)}
          className={cn(
            'flex-1 rounded-8 px-2.5 py-1.5 text-body-m-semibold transition-colors',
            active === i ? 'bg-white text-gray-900' : 'text-gray-400',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function RankingBody({ tabs, ranking, averagePeriod }: RankingContent) {
  return (
    <>
      <div className="flex flex-col gap-2 p-5">
        {tabs && <SegmentedTabs tabs={tabs} />}
        <div className="divide-y divide-gray-90">
          {ranking.map((d) => (
            <DistrictRankRow key={d.rank} {...d} />
          ))}
        </div>
      </div>
      {averagePeriod && (
        <>
          <SectionDivider />
          <PeriodSection {...averagePeriod} />
        </>
      )}
    </>
  )
}

function GradeBody({ quarter, grade, status, lastGrade, trend, trendTicks }: GradeContent) {
  return (
    <>
      <div className="flex flex-col items-center gap-2 px-5 py-6">
        <p className="w-full text-body-l-semibold text-gray-800">{quarter}</p>
        <GradeGauge grade={grade} status={status} />
        {lastGrade && (
          <span className="flex items-center gap-2 rounded-max bg-gray-70 px-3 py-1.5 text-body-m-medium">
            <span className="text-gray-400">지난 분기 등급</span>
            <span className="font-semibold text-gray-700">{lastGrade}</span>
          </span>
        )}
      </div>
      <SectionDivider />
      <div className="px-5 py-6">
        <TrendGraph title="3년 추이" variant="grade" data={trend} xTicks={trendTicks} />
      </div>
    </>
  )
}

function MetricBody({
  quarter,
  value,
  unit,
  comparison,
  trend,
  trendTicks,
  trendUnit,
  highlightLabel,
  yFormatter,
  averagePeriod,
}: MetricContent) {
  return (
    <>
      <div className="flex flex-col gap-2.5 px-5 py-6">
        <p className="text-body-l-semibold text-gray-800">{quarter}</p>
        <div className="flex flex-col items-center gap-1">
          <p className="flex items-center gap-0.5">
            <span className="text-[28px] font-semibold tracking-[-0.02em] text-key">{value}</span>
            <span className="text-[20px] font-semibold tracking-[-0.02em] text-gray-900">
              {unit}
            </span>
          </p>
          {comparison && (
            <span className="flex items-center gap-2.5">
              <span className="text-body-l-regular text-gray-400">{comparison.label}</span>
              <span
                className={cn(
                  'flex items-center gap-0.5 rounded-6 px-2 py-0.5',
                  CHANGE_BG[comparison.direction],
                )}
              >
                <span className={cn('text-body-l-regular', CHANGE_TEXT[comparison.direction])}>
                  {comparison.percent}
                </span>
                <ChangeIndicator direction={comparison.direction} />
              </span>
            </span>
          )}
        </div>
      </div>
      <SectionDivider />
      <div className="px-5 py-6">
        <TrendGraph
          title="3년 추이"
          data={trend}
          xTicks={trendTicks}
          unit={trendUnit}
          highlightLabel={highlightLabel}
          yFormatter={yFormatter}
        />
      </div>
      {averagePeriod && (
        <>
          <SectionDivider />
          <PeriodSection {...averagePeriod} />
        </>
      )}
    </>
  )
}

/**
 * 상권 분석 바텀시트 (Figma: Bottom Sheet 353:10218).
 * 셸(BottomSheet) + content 종류별 조립:
 * - `ranking`: 세그먼트 탭 + 순위 리스트(DistrictRankRow) + 평균 영업 기간 (All)
 * - `grade`: 반원 게이지(GradeGauge) + 지난 분기 pill + 3년 추이 등급 (Grade)
 * - `metric`: 값 + 증감칩 + 3년 추이 값 (+평균 영업 기간) (Graph / Graph_Period)
 */
export function DistrictSheet({ open, onClose, title, subtitle, content }: DistrictSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} subtitle={subtitle}>
      {content.type === 'ranking' && <RankingBody {...content} />}
      {content.type === 'grade' && <GradeBody {...content} />}
      {content.type === 'metric' && <MetricBody {...content} />}
    </BottomSheet>
  )
}
