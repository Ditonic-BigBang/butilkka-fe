import { useNavigate } from 'react-router-dom'
import Download from '~icons/ci/download'
import { MobileLayout } from '@/widgets/mobile-layout'
import { ReportOverview, ReportOverviewSkeleton } from '@/widgets/report-overview'
import { THEME_COLORS } from '@/shared/lib/themeColors'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { formatQuarter } from '@/shared/lib/quarter'
import { ErrorRetry } from '@/shared/ui'
import { ReportLinkButton, downloadReport } from '@/entities/report'
import { useAuthStore } from '@/entities/session'
import { useLatestReport, useReportHistory } from './model/useLatestReport'

/**
 * AI 리포트 (Figma: [3] AI 리포트/[3-1] 기본 267:4266·4528 · API: GET /api/v1/reports/latest).
 * 헤더(상권·업종) + 리포트 본문(ReportOverview 위젯) — 점수 카드 아래에
 * "이전 리포트 확인하러 가기" 버튼(히스토리 이동)을 끼운다. 하단 탭 있음.
 * 리포트 PRO 구독 전이면 유사 사례부터 잠그고 결제 유도 카드를 띄운다.
 */
export default function ReportPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const locked = !user?.isReportPro
  const report = useLatestReport()
  const history = useReportHistory()
  // 리포트 배경(gray-70)에 노치·상태바 색을 맞춰 이어 보이게 (Android 상태바 색)
  useThemeColor(THEME_COLORS.surfaceGray)

  // 이전 분기 리포트 (히스토리에서 현재 분기보다 앞선 첫 항목) — 없으면 버튼 숨김
  const previous = report.data
    ? history.data?.find((r) => r.quarter < report.data.quarter)
    : undefined

  let content
  if (report.isPending) {
    content = <ReportOverviewSkeleton />
  } else if (report.isError) {
    content = <ErrorRetry message="리포트를 불러오지 못했어요" onRetry={() => report.refetch()} />
  } else {
    content = (
      <ReportOverview
        data={report.data}
        afterScore={
          previous && (
            <ReportLinkButton
              quarter={formatQuarter(previous.quarter)}
              grade={previous.grade}
              // 지난 리포트는 PRO 혜택 — 구독 전엔 구독 플랜 확인으로 유도
              onClick={() => navigate(locked ? '/my/subscription' : '/report/history')}
            />
          )
        }
        locked={locked}
        onUpgrade={() => navigate('/my/subscription')}
        onViewAllCases={() => navigate(`/report/${report.data.reportId}/cases`)}
        onViewMap={() => navigate('/map')}
      />
    )
  }

  return (
    // className: 프레임(노치 영역 포함) 배경을 gray-70 로 → iOS 노치가 리포트 배경과 이어짐
    <MobileLayout className="bg-gray-70">
      <div className="min-h-full bg-gray-70">
        <ReportHeader
          region={report.data?.regionName}
          category={report.data?.categoryName}
          onDownload={downloadReport}
        />
        {content}
      </div>
    </MobileLayout>
  )
}

/** 상단 헤더 — "AI 리포트" 타이틀 + 상권·업종 + 우측 다운로드 버튼 (Figma: 1501:14285) */
function ReportHeader({
  region,
  category,
  onDownload,
}: {
  region?: string
  category?: string
  onDownload: () => void
}) {
  return (
    // items-end: 다운로드 버튼(37)이 타이틀 블록 하단에 맞춰짐 (Figma)
    <header className="flex items-end gap-2.5 bg-gray-70 px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-title-s-semibold text-gray-900">AI 리포트</h1>
        {region && category && (
          <div className="flex items-center gap-1 text-body-m-regular text-gray-400">
            <span>{region} 인근</span>
            <span aria-hidden className="size-0.5 rounded-full bg-gray-200" />
            <span>{category}</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onDownload}
        aria-label="리포트 다운로드"
        className="flex size-[37px] shrink-0 items-center justify-center rounded-8 bg-white text-gray-600 transition active:scale-95"
      >
        <Download aria-hidden className="size-6" />
      </button>
    </header>
  )
}
