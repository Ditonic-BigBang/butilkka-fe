import { useMemo, useState } from 'react'
import ChevronLeft from '~icons/ci/chevron-left'
import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

type MonthView = { year: number; month: number }

function shiftMonth({ year, month }: MonthView, delta: number): MonthView {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

// 6주(42칸) 그리드 — 그 주 일요일부터 시작, 앞뒤 달 날짜로 채움
function buildGrid({ year, month }: MonthView): Date[] {
  const firstWeekday = new Date(year, month, 1).getDay() // 0=일
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - firstWeekday + i))
}

type CalendarProps = {
  /** 선택된 날짜 */
  value?: Date
  onSelect?: (date: Date) => void
  /** 처음 보여줄 달 (기본: value 또는 오늘) */
  defaultMonth?: Date
  className?: string
}

/**
 * 월 단위 캘린더 (커스텀 · 라이브러리 없음).
 * 월 이동(◀▶) · 일~토 · 날짜 선택. 선택일 오렌지 원, 오늘 키 컬러 글자, 이전/다음 달 gray-300.
 * 팝업/시트는 `DatePicker` 가 담당 — 이건 순수 그리드.
 */
export function Calendar({ value, onSelect, defaultMonth, className }: CalendarProps) {
  const [today] = useState(() => new Date())
  const [view, setView] = useState<MonthView>(() => {
    const base = defaultMonth ?? value ?? today
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const days = useMemo(() => buildGrid(view), [view])

  return (
    <div className={cn('w-full', className)}>
      {/* 헤더: 연월 + 이동 */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => setView((v) => shiftMonth(v, -1))}
          className="flex size-8 items-center justify-center rounded-8 text-gray-600 active:bg-gray-70"
        >
          <ChevronLeft aria-hidden className="size-6" />
        </button>
        <span className="text-title-s-semibold text-gray-900">
          {view.year}년 {view.month + 1}월
        </span>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => setView((v) => shiftMonth(v, 1))}
          className="flex size-8 items-center justify-center rounded-8 text-gray-600 active:bg-gray-70"
        >
          <ChevronRight aria-hidden className="size-6" />
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="flex h-9 items-center justify-center text-body-m-medium text-gray-400"
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((d) => {
          const inMonth = d.getMonth() === view.month
          const selected = value != null && sameDay(d, value)
          const isToday = sameDay(d, today)
          return (
            <button
              key={`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}
              type="button"
              aria-label={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`}
              aria-pressed={selected}
              onClick={() => onSelect?.(d)}
              className="flex h-10 items-center justify-center"
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-max text-body-l-medium leading-none tabular-nums',
                  selected
                    ? 'bg-key text-white'
                    : !inMonth
                      ? 'text-gray-300'
                      : isToday
                        ? 'text-key'
                        : 'text-gray-900',
                )}
              >
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
