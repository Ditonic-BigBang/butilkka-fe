import { cn } from '@/shared/lib/cn'

type SettingRowProps = {
  title: string
  /** 제목 아래 보조 설명 */
  description?: string
  /** 우측 컨트롤 (주로 Toggle · chevron 등) */
  trailing?: React.ReactNode
  className?: string
}

/**
 * 설정/마이페이지 리스트 행 (Figma: List_알림설정_마이페이지 286:5041).
 * 흰 배경 · p-16. 좌측 제목(gray-800 semibold) + 부제(gray-500 12px, gap-4),
 * 우측 `trailing` 슬롯(주로 `Toggle`). 세로 중앙 정렬.
 */
export function SettingRow({ title, description, trailing, className }: SettingRowProps) {
  return (
    <div className={cn('flex w-full items-center gap-3 bg-white p-4', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-body-l-semibold text-gray-800">{title}</p>
        {description && <p className="text-caption-l-regular text-gray-500">{description}</p>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  )
}
