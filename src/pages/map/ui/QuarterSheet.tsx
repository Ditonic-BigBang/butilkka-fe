import { useEffect, useState } from 'react'
import { BottomSheet, PeriodChip, CTA } from '@/shared/ui'
import { buildQuarterOptions } from '../model/quarterOptions'

type QuarterSheetProps = {
  open: boolean
  onClose: () => void
  /** 옵션 생성 기준 — 데이터의 가장 최근 분기 (예: "2026Q1") */
  latestQuarter?: string
  /** 현재 적용된 분기 — null 이면 최신 분기 */
  value: string | null
  onApply: (quarter: string) => void
}

/**
 * 조회 분기 선택 바텀시트 (Figma: 기간 선택시 176:2131).
 * 최근 3년 분기를 연도별 PeriodChip 으로 나열, 적용 시에만 반영(시트 안은 draft).
 */
export function QuarterSheet({ open, onClose, latestQuarter, value, onApply }: QuarterSheetProps) {
  const [draft, setDraft] = useState<string | null>(null)

  // 열릴 때마다 현재 적용값(없으면 최신 분기)으로 초기화
  useEffect(() => {
    if (open) setDraft(value ?? latestQuarter ?? null)
  }, [open, value, latestQuarter])

  if (!latestQuarter) return null

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-1 px-5">
          <p className="text-title-s-semibold text-gray-900">조회할 분기 선택</p>
          <p className="text-body-m-medium text-gray-400">
            최근 3년까지 조회할 수 있어요. 기본은 가장 최근 분기예요.
          </p>
        </div>

        <div className="flex flex-col gap-5 px-5">
          {buildQuarterOptions(latestQuarter).map(({ year, quarters }) => (
            <div key={year} className="flex flex-col gap-2">
              <p className="text-body-l-medium text-gray-400">{year}년</p>
              <div className="flex gap-1">
                {quarters.map((quarter) => (
                  <PeriodChip
                    key={quarter}
                    selected={draft === quarter}
                    onClick={() => setDraft(quarter)}
                  >
                    {quarter.slice(-1)}분기
                  </PeriodChip>
                ))}
              </div>
            </div>
          ))}
        </div>

        <CTA
          onClick={() => {
            if (!draft) return
            onApply(draft)
            onClose()
          }}
        >
          적용
        </CTA>
      </div>
    </BottomSheet>
  )
}
