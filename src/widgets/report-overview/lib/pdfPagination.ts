/** 캡처 이미지 안에서 잘리면 안 되는 블록(카드)의 세로 구간 (px, 문서 상단 기준) */
export type PdfBlock = { top: number; bottom: number }

/** 한 PDF 페이지에 들어갈 캡처 이미지의 세로 구간 [start, end) (px) */
export type PageSlice = { start: number; end: number }

/**
 * 블록(카드) 경계를 지키며 캡처 이미지를 페이지 높이 단위로 자를 위치를 계산한다.
 * - 블록이 현재 페이지에 다 못 들어가면 블록 시작점에서 페이지를 끊는다 (카드 중간 잘림 방지)
 * - 블록 하나가 페이지보다 크면 어쩔 수 없이 페이지 높이로 하드 컷
 * - 블록 밖 여백(gap·패딩)은 앞 페이지 꼬리에 그대로 붙는다
 */
export function computePageSlices(
  blocks: PdfBlock[],
  pageHeight: number,
  totalHeight: number,
): PageSlice[] {
  const slices: PageSlice[] = []
  let start = 0

  for (const block of blocks) {
    if (block.bottom - start <= pageHeight) continue // 현재 페이지에 들어감

    // 블록 시작 전에서 페이지를 끊는다 (이미 페이지 첫 블록이면 자를 앞부분이 없음)
    if (block.top > start) {
      slices.push({ start, end: block.top })
      start = block.top
    }
    // 페이지보다 큰 블록은 페이지 높이로 하드 컷
    while (block.bottom - start > pageHeight) {
      slices.push({ start, end: start + pageHeight })
      start += pageHeight
    }
  }

  // 남은 꼬리 (마지막 블록 이후 여백 포함)
  while (totalHeight - start > pageHeight) {
    slices.push({ start, end: start + pageHeight })
    start += pageHeight
  }
  if (totalHeight > start) slices.push({ start, end: totalHeight })

  return slices
}
