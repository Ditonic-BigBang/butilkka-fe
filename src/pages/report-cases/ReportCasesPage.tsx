import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { Dropdown, DropdownOption, SortTrigger } from '@/shared/ui'
import { SimilarCaseCard } from '@/entities/report'
import { CASE_SORT_LABELS, useReportCases, type CaseSortOrder } from './model/useReportCases'

/**
 * 유사 사례 전체보기 (Figma: [3-5] 유사사례 전체보기 267:5486 · API: GET /api/v1/reports/{reportId}/cases).
 * 리포트의 유사 사례 "전체 보기" → 진입하는 상세 화면(하단 탭 없음).
 * GNB(뒤로) + 정렬(기간순/추천순) + 유사 사례 아코디언 리스트(공통 SimilarCaseCard) —
 * 카드를 펼치면 AI 설명(✦)과 관련 태그가 보인다.
 */
export default function ReportCasesPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [order, setOrder] = useState<CaseSortOrder>('period')
  const [menuOpen, setMenuOpen] = useState(false)
  const cases = useReportCases(Number(reportId), order)

  const selectOrder = (next: CaseSortOrder) => {
    setOrder(next)
    setMenuOpen(false)
  }

  let content
  if (cases.isPending) {
    content = <CasesSkeleton />
  } else if (cases.isError) {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-body-l-medium text-gray-500">유사 사례를 불러오지 못했어요</p>
        <button
          type="button"
          onClick={() => cases.refetch()}
          className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
        >
          다시 시도
        </button>
      </div>
    )
  } else if (cases.data.length === 0) {
    content = (
      <p className="flex flex-1 items-center justify-center py-20 text-body-l-medium text-gray-400">
        수집된 유사 사례가 없어요
      </p>
    )
  } else {
    content = (
      <ul className="flex stagger-fade-up flex-col gap-3 px-5 pb-6">
        {cases.data.map((c) => (
          <li key={c.caseId}>
            <SimilarCaseCard
              region={c.region}
              period={c.period}
              summary={c.summary}
              explanation={c.explanation}
              tags={c.tags}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        <GNB title="유사 사례" onBack={() => navigate(-1)} showSettings={false} />

        {/* 정렬 트리거 + 드롭다운 (Figma: Trigger_Sort Dropdown / Dropdown_M) */}
        <div className="relative px-5 py-3">
          <SortTrigger
            label={CASE_SORT_LABELS[order]}
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
                {(Object.keys(CASE_SORT_LABELS) as CaseSortOrder[]).map((key) => (
                  <DropdownOption
                    key={key}
                    selected={order === key}
                    onClick={() => selectOrder(key)}
                  >
                    {CASE_SORT_LABELS[key]}
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

/** 로딩 스켈레톤 — 유사 사례 카드 형태 4장 */
function CasesSkeleton() {
  return (
    <ul className="flex flex-col gap-3 px-5">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-[107px] animate-pulse rounded-12 bg-gray-70" />
      ))}
    </ul>
  )
}
