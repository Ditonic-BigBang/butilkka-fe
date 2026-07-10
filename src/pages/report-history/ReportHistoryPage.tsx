import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { Dropdown, DropdownOption, SortTrigger } from '@/shared/ui'
import { ReportCard, reportKeys } from '@/entities/report'
import type { ReportHistoryResponse } from '@/shared/api/types'
import { SORT_LABELS, useReportHistoryList, type SortOrder } from './model/useReportHistoryList'

/**
 * 리포트 상세보기(히스토리) (Figma: [3-3] 리포트 상세보기 267:5542 · API: GET /api/v1/reportsHistory).
 * AI 리포트의 "이전 리포트 확인하러 가기" → 진입하는 상세 화면(하단 탭 없음).
 * GNB(뒤로·설정) + 정렬(최신순/오래된순) + 분기별 리포트 리스트(공통 ReportCard).
 * 안 읽음은 soft-blue 강조.
 */
export default function ReportHistoryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [order, setOrder] = useState<SortOrder>('latest')
  const [menuOpen, setMenuOpen] = useState(false)
  const reports = useReportHistoryList(order)

  const selectOrder = (next: SortOrder) => {
    setOrder(next)
    setMenuOpen(false)
  }

  // 상세로 이동하며 캐시도 읽음 처리 — 목록에 돌아왔을 때 강조가 바로 사라진다.
  // (서버(목)도 상세 조회 시 읽음 처리하므로 이후 재조회와도 일치)
  const openReport = (reportId: number) => {
    queryClient.setQueryData<ReportHistoryResponse>(reportKeys.history(), (prev) =>
      prev
        ? {
            ...prev,
            reports: prev.reports.map((r) =>
              r.reportId === reportId ? { ...r, isRead: true } : r,
            ),
          }
        : prev,
    )
    navigate(`/report/${reportId}`)
  }

  let content
  if (reports.isPending) {
    content = <HistorySkeleton />
  } else if (reports.isError) {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-body-l-medium text-gray-500">리포트 목록을 불러오지 못했어요</p>
        <button
          type="button"
          onClick={() => reports.refetch()}
          className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
        >
          다시 시도
        </button>
      </div>
    )
  } else if (reports.data.length === 0) {
    content = (
      <p className="flex flex-1 items-center justify-center py-20 text-body-l-medium text-gray-400">
        발행된 리포트가 없어요
      </p>
    )
  } else {
    content = (
      <ul className="flex stagger-fade-up flex-col">
        {reports.data.map((report) => (
          <li key={report.reportId}>
            <ReportCard
              quarter={report.quarter}
              title={report.title}
              summary={report.summary}
              read={report.read}
              onClick={() => openReport(report.reportId)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        {/* 설정 기어는 디자인대로 노출만 — 이동 동작 없음(의도) */}
        <GNB title="리포트 상세보기" onBack={() => navigate(-1)} />

        {/* 정렬 트리거 + 드롭다운 (Figma: Trigger_Sort Dropdown / Dropdown_M) */}
        <div className="relative px-5 py-3">
          <SortTrigger
            label={SORT_LABELS[order]}
            direction={menuOpen ? 'asc' : 'desc'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          />
          {menuOpen && (
            <>
              {/* 바깥 탭 → 메뉴 닫기 */}
              <button
                type="button"
                aria-label="정렬 메뉴 닫기"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <Dropdown className="absolute top-11 left-5 z-20">
                {(Object.keys(SORT_LABELS) as SortOrder[]).map((key) => (
                  <DropdownOption
                    key={key}
                    selected={order === key}
                    onClick={() => selectOrder(key)}
                  >
                    {SORT_LABELS[key]}
                  </DropdownOption>
                ))}
              </Dropdown>
            </>
          )}
        </div>

        {content}
      </div>
    </MobileLayout>
  )
}

/** 로딩 스켈레톤 — 리포트 카드 행 형태 3줄 */
function HistorySkeleton() {
  return (
    <ul className="flex flex-col gap-4 px-5 pt-2">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex gap-3">
          <div className="size-7 shrink-0 animate-pulse rounded-lg bg-gray-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-gray-100" />
          </div>
        </li>
      ))}
    </ul>
  )
}
