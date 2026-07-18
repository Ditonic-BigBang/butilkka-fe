import { useNavigate, useParams } from 'react-router-dom'
import Download from '~icons/ci/download'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import {
  ReportOverview,
  ReportOverviewSkeleton,
  useReportPdfDownload,
} from '@/widgets/report-overview'
import { THEME_COLORS } from '@/shared/lib/themeColors'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { ErrorRetry, Spinner, Toast } from '@/shared/ui'
import { useReportDetail } from './model/useReportDetail'

/**
 * 지난 리포트 상세보기 (Figma: [3-4] 지난 리포트 상세보기 267:4395 · API: GET /api/v1/reports/{reportId}).
 * 히스토리 목록에서 리포트 탭 → 진입하는 상세 화면(하단 탭 없음).
 * GNB(뒤로·리포트 다운로드) + 리포트 본문(ReportOverview 위젯) — 최신 리포트([3-1])와
 * 본문은 동일하고 "이전 리포트 확인하러 가기" 버튼만 없다.
 */
export default function ReportDetailPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const report = useReportDetail(Number(reportId))
  const pdf = useReportPdfDownload(report.data)
  // 리포트 배경(gray-70)에 노치·상태바 색을 맞춰 이어 보이게 (Android 상태바 색)
  useThemeColor(THEME_COLORS.surfaceGray)

  let content
  if (report.isPending) {
    content = <ReportOverviewSkeleton />
  } else if (report.isError) {
    content = <ErrorRetry message="리포트를 불러오지 못했어요" onRetry={() => report.refetch()} />
  } else {
    content = (
      <ReportOverview
        data={report.data}
        onViewAllCases={() =>
          navigate(`/report/${report.data.reportId}/cases`, { viewTransition: true })
        }
        onViewMap={() => navigate('/map', { viewTransition: true })}
      />
    )
  }

  return (
    <MobileLayout showBottomTab={false} className="bg-gray-70">
      <div className="min-h-full bg-gray-70">
        {/* 우측 undo(디자인) = 최신 리포트로 이동 */}
        <GNB
          title="리포트 상세보기"
          onBack={() => navigate(-1)}
          className="bg-gray-70"
          right={
            <button
              type="button"
              onClick={pdf.download}
              disabled={pdf.downloading}
              aria-label="리포트 다운로드"
              aria-busy={pdf.downloading}
              className="transition active:scale-95"
            >
              {pdf.downloading ? (
                <Spinner aria-label="PDF 생성 중" className="size-5" />
              ) : (
                <Download aria-hidden className="size-6 shrink-0 text-gray-300" />
              )}
            </button>
          }
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
    </MobileLayout>
  )
}
