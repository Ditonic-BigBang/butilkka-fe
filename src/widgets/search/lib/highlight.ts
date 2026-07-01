export type HighlightPart = { text: string; match: boolean; key: string }

/**
 * 라벨에서 검색어 매칭 구간을 분리 (대소문자 무시).
 * 매칭 없거나 검색어 없으면 전체를 비매칭 한 조각으로 반환.
 * @example highlight('서울 서대문구', '서대')
 * // [{text:'서울 ',match:false}, {text:'서대',match:true}, {text:'문구',match:false}]
 */
export function highlight(label: string, query?: string): HighlightPart[] {
  const q = query?.trim()
  if (!q) return [{ text: label, match: false, key: 'all' }]
  const idx = label.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return [{ text: label, match: false, key: 'all' }]
  return [
    { text: label.slice(0, idx), match: false, key: 'pre' },
    { text: label.slice(idx, idx + q.length), match: true, key: 'hit' },
    { text: label.slice(idx + q.length), match: false, key: 'post' },
  ].filter((p) => p.text)
}
