import { useNavigate, useParams } from 'react-router-dom'
import Undo from '~icons/ci/undo'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { ReportOverview, ReportOverviewSkeleton } from '@/widgets/report-overview'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import { useReportDetail } from './model/useReportDetail'

/**
 * 지난 리포트 상세보기 (Figma: [3-4] 지난 리포트 상세보기 267:4395 · API: GET /api/v1/reports/{reportId}).
 * 히스토리 목록에서 리포트 탭 → 진입하는 상세 화면(하단 탭 없음).
 * GNB(뒤로·최신 리포트 이동) + 리포트 본문(ReportOverview 위젯) — 최신 리포트([3-1])와
 * 본문은 동일하고 "이전 리포트 확인하러 가기" 버튼만 없다.
 */
export default function ReportDetailPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const report = useReportDetail(Number(reportId))
  // 리포트 배경(gray-70)에 노치·상태바 색을 맞춰 이어 보이게 (Android 상태바 색)
  useThemeColor('#f7f7f7')

  let content
  if (report.isPending) {
    content = <ReportOverviewSkeleton />
  } else if (report.isError) {
    content = (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-body-l-medium text-gray-500">리포트를 불러오지 못했어요</p>
        <button
          type="button"
          onClick={() => report.refetch()}
          className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
        >
          다시 시도
        </button>
      </div>
    )
  } else {
    content = <ReportOverview data={report.data} onViewMap={() => navigate('/map')} />
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
              onClick={() => navigate('/report')}
              aria-label="최신 리포트로 가기"
            >
              <Undo aria-hidden className="size-6 shrink-0 text-gray-300" />
            </button>
          }
        />
        {content}
      </div>
    </MobileLayout>
  )
}
