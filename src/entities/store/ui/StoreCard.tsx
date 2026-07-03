import Building from '~icons/ci/building-01'
import { OutlineButton } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type StoreCardProps = {
  /** 창업 (예: "2022년 8월 창업") */
  founded: string
  name: string
  address: string
  /** 현재 대표 위치 여부 — true 면 "현재 대표 위치" 오렌지 칩 표시 */
  primary?: boolean
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

/**
 * 내 가게 카드 (Figma: List_M_가게 427:19595).
 * 빌딩 아이콘 + [창업일(+대표위치 칩) / 가게명 / 주소] + 수정·삭제 버튼(OutlineButton).
 * `primary` 면 창업일 옆에 "현재 대표 위치" 오렌지 칩(rounded-6).
 */
export function StoreCard({
  founded,
  name,
  address,
  primary = false,
  onEdit,
  onDelete,
  className,
}: StoreCardProps) {
  return (
    <div
      className={cn(
        'flex w-full items-start gap-3 border-b border-gray-100 bg-white px-5 py-4',
        className,
      )}
    >
      <Building aria-hidden className="size-6 shrink-0 text-gray-600" />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-caption-l-regular text-gray-500">{founded}</span>
              {primary && (
                <span className="shrink-0 rounded-6 bg-orange-50 px-3 py-1 text-caption-l-regular text-orange-500">
                  현재 대표 위치
                </span>
              )}
            </div>
            <span className="text-body-l-semibold text-gray-900">{name}</span>
          </div>
          <span className="text-body-m-regular text-gray-700">{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={onEdit}>수정</OutlineButton>
          <OutlineButton onClick={onDelete}>삭제</OutlineButton>
        </div>
      </div>
    </div>
  )
}
