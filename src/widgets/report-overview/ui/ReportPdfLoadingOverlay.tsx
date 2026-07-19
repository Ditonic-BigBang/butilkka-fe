import { Spinner } from '@/shared/ui'

/** PDF 캡처·조립 중 앱 프레임 전체의 조작을 막고 화면 중앙에 진행 상태를 표시한다. */
export function ReportPdfLoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
      <Spinner aria-label="PDF 생성 중" />
    </div>
  )
}
