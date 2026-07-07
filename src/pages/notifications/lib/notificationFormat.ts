import type { NotificationCategory } from '@/shared/api/types'

// 카테고리 enum → 화면 라벨
const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  EMERGENCY: '긴급 알림',
  REPORT: '정기 알림',
  SYSTEM: '시스템 알림',
}

export const categoryLabel = (category: NotificationCategory): string =>
  CATEGORY_LABEL[category] ?? '알림'

const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * sentAt(ISO 8601, 오프셋 없음) → 표시용 시각.
 * 24시간 이내면 상대시간("방금"·"N분전"·"N시간전"), 그 이전이면 "YYYY.MM.DD".
 */
export function formatSentAt(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const diffMin = Math.floor((Date.now() - then) / 60_000)
  if (diffMin < 1) return '방금'
  if (diffMin < 60) return `${diffMin}분전`
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간전`

  const d = new Date(iso)
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}
