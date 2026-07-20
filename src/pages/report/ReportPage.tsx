import { useNavigate } from 'react-router-dom'
import Download from '~icons/ci/download'
import { MobileLayout } from '@/widgets/mobile-layout'
import {
  ReportOverview,
  ReportOverviewSkeleton,
  ReportPdfLoadingOverlay,
  useReportPdfDownload,
} from '@/widgets/report-overview'
import { THEME_COLORS } from '@/shared/lib/themeColors'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { formatQuarter } from '@/shared/lib/quarter'
import { ErrorRetry, Toast } from '@/shared/ui'
import { ReportLinkButton } from '@/entities/report'
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
  const pdf = useReportPdfDownload(report.data, { locked })
  // 리포트 배경(gray-70)에 노치·상태바 색을 맞춰 이어 보이게 (Android 상태바 색)
  useThemeColor(THEME_COLORS.surfaceGray)

  // 이전 분기 리포트 (히스토리에서 현재 분기보다 앞선 첫 항목).
  // 없어도(신규 유저 첫 분기) 버튼은 라벨만 있는 변형으로 항상 노출 — 히스토리/구독 진입점 유지.
  // 주의: 히스토리는 내 가게 전체의 리포트가 섞여 오는데 항목에 가게 식별자가 없어 분기만 비교한다
  // — 다점포면 다른 가게의 이전 분기를 집을 수 있음. 백엔드가 storeId/regionCode 주면 같은 가게로 필터할 것.
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
          <ReportLinkButton
            quarter={previous && formatQuarter(previous.quarter)}
            grade={previous?.grade}
            // 지난 리포트는 PRO 혜택 — 구독 전엔 구독 플랜 확인으로 유도
            onClick={() =>
              navigate(locked ? '/my/subscription' : '/report/history', { viewTransition: true })
            }
          />
        }
        locked={locked}
        onUpgrade={() => navigate('/my/subscription', { viewTransition: true })}
        onViewAllCases={() =>
          navigate(`/report/${report.data.reportId}/cases`, { viewTransition: true })
        }
        onViewMap={(district) =>
          navigate('/map', { viewTransition: true, state: { focusDistrict: district } })
        }
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
          // PDF 다운로드는 PRO 혜택 — 구독 전에는 버튼 자체를 숨긴다
          onDownload={locked ? undefined : pdf.download}
          downloading={pdf.downloading}
        />
        {content}
      </div>
      {pdf.toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto flex max-w-[430px] justify-center px-5">
          <Toast className={pdf.closing ? 'animate-toast-out' : 'animate-toast-in'}>
            {pdf.toast}
          </Toast>
        </div>
      )}
      {pdf.downloading && <ReportPdfLoadingOverlay />}
    </MobileLayout>
  )
}

/** 상단 헤더 — "AI 리포트" 타이틀 + 상권·업종 + 우측 다운로드 버튼 (Figma: 1501:14285) */
function ReportHeader({
  region,
  category,
  onDownload,
  downloading = false,
}: {
  region?: string
  category?: string
  /** 없으면 다운로드 버튼 미노출 (구독 전 — PDF 는 PRO 혜택) */
  onDownload?: () => void
  /** PDF 생성 중 — 버튼 중복 클릭 방지 */
  downloading?: boolean
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
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          aria-label="리포트 다운로드"
          aria-busy={downloading}
          className="flex size-[37px] shrink-0 items-center justify-center rounded-8 bg-white text-gray-600 transition active:scale-95 disabled:opacity-60"
        >
          <Download aria-hidden className="size-6" />
        </button>
      )}
    </header>
  )
}
