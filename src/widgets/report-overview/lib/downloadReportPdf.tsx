import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { ReportPdfDocument, PDF_DOC_WIDTH } from '../ui/ReportPdfDocument'
import { computePageSlices, type PdfBlock } from './pdfPagination'
import type { ReportView } from '../model/reportView'

// A4 (mm) — 여백 밖은 흰 종이, 안쪽에 gray-70 문서 패널이 앉는다
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 12

const DOC_BG = '#f7f7f7' // --color-gray-70
const CAPTURE_SCALE = 2 // 텍스트 선명도용 캡처 배율

/** 파일명에 못 쓰는 문자 제거 + 공백은 붙임 */
const cleanFilePart = (s: string) => s.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '')

/** 예: 버틸까_AI리포트_역삼동_2026년2분기.pdf */
function toFilename(view: ReportView) {
  return `버틸까_AI리포트_${cleanFilePart(view.regionName)}_${cleanFilePart(view.period)}.pdf`
}

/** 다음 페인트까지 대기 — 오프스크린 렌더가 레이아웃·페인트를 마친 뒤 캡처하기 위함 */
function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/**
 * 리포트 PDF 다운로드 — 오프스크린에 PDF 전용 문서를 렌더해 통짜 캡처한 뒤,
 * 카드(data-pdf-block) 경계에서 A4 다중 페이지로 잘라 저장한다.
 * snapdom(캡처)·jsPDF(조립)는 이 시점에 lazy-load — 초기 번들·선캐시에 안 들어간다.
 */
export async function downloadReportPdf(view: ReportView, { locked = false } = {}) {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = `position:fixed;top:0;left:-10000px;width:${PDF_DOC_WIDTH}px;pointer-events:none;`
  document.body.appendChild(host)
  const root = createRoot(host)

  try {
    // 라이브러리 로드와 문서 렌더·폰트 준비를 병렬로
    const libs = Promise.all([import('@zumer/snapdom'), import('jspdf')])
    flushSync(() => root.render(<ReportPdfDocument view={view} locked={locked} />))
    await document.fonts.ready
    await nextFrame()

    const doc = host.firstElementChild as HTMLElement
    const docRect = doc.getBoundingClientRect()
    const blocks: PdfBlock[] = [...doc.querySelectorAll('[data-pdf-block]')].map((el) => {
      const r = el.getBoundingClientRect()
      return { top: r.top - docRect.top, bottom: r.bottom - docRect.top }
    })

    const [{ snapdom }, { jsPDF }] = await libs
    const canvas = await snapdom.toCanvas(doc, {
      scale: CAPTURE_SCALE,
      backgroundColor: DOC_BG,
      embedFonts: true,
    })

    // px→mm 환산: 문서 폭(420px) = 콘텐츠 폭(186mm)
    const contentW = PAGE_W - MARGIN * 2
    const mmPerPx = contentW / docRect.width
    const pageHeightPx = (PAGE_H - MARGIN * 2) / mmPerPx
    const slices = computePageSlices(blocks, pageHeightPx, docRect.height)
    const pxRatio = canvas.width / docRect.width // 캡처 배율 실측 (scale 옵션과 무관하게 안전)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
    slices.forEach((slice, i) => {
      if (i > 0) pdf.addPage()
      const sliceH = Math.round((slice.end - slice.start) * pxRatio)
      const page = document.createElement('canvas')
      page.width = canvas.width
      page.height = sliceH
      const ctx = page.getContext('2d')
      if (!ctx) throw new Error('canvas 2d context 생성 실패')
      ctx.fillStyle = DOC_BG
      ctx.fillRect(0, 0, page.width, page.height)
      ctx.drawImage(
        canvas,
        0,
        Math.round(slice.start * pxRatio),
        canvas.width,
        sliceH,
        0,
        0,
        canvas.width,
        sliceH,
      )
      pdf.addImage(
        page.toDataURL('image/jpeg', 0.92),
        'JPEG',
        MARGIN,
        MARGIN,
        contentW,
        (slice.end - slice.start) * mmPerPx,
      )
    })

    pdf.save(toFilename(view))
  } finally {
    root.unmount()
    host.remove()
  }
}
