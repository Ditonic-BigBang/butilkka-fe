import { useState } from 'react'
import { useTransientToast } from '@/shared/lib/useTransientToast'
import type { ReportView } from './reportView'

/**
 * 리포트 PDF 다운로드 버튼 상태 — 생성 중 플래그 + 실패 토스트.
 * 캡처·조립 모듈(downloadReportPdf)은 클릭 시점에 lazy-load 한다.
 * 렌더 쪽: 버튼 비활성화 + 페이지 중앙 로딩 오버레이, 실패 시 Toast 를 표시한다.
 */
export function useReportPdfDownload(view: ReportView | undefined, { locked = false } = {}) {
  const [downloading, setDownloading] = useState(false)
  const { toast, closing, show } = useTransientToast()

  const download = async () => {
    if (!view || downloading) return
    setDownloading(true)
    try {
      const { downloadReportPdf } = await import('../lib/downloadReportPdf')
      await downloadReportPdf(view, { locked })
    } catch (error) {
      console.error('[report] PDF 다운로드 실패', error)
      show('리포트 다운로드에 실패했어요')
    } finally {
      setDownloading(false)
    }
  }

  return { download, downloading, toast, closing }
}
