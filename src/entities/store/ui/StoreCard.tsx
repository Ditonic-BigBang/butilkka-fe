import Building from '~icons/ci/building-01'
import { OutlineButton, Tag } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type StoreCardProps = {
  /** 창업 (예: "2022년 8월 12일 창업") */
  founded: string
  name: string
  address: string
  /** 업종명 (예: "커피·음료") — 있으면 하단에 업종 칩 표시 */
  category?: string
  /** 현재 대표 위치 여부 — true 면 카드 상단에 "현재 대표 위치" 오렌지 라벨 표시 */
  primary?: boolean
  /** 카드 본문 탭 (수정·삭제 버튼 제외) — 대표 위치 지정 등 */
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

/**
 * 내 가게 카드 (Figma: List_M_가게 1198:26538).
 * (대표면) 상단 "현재 대표 위치" 라벨 + [빌딩 아이콘 · 창업일 / 가게명 / 주소 · 업종 칩 + 수정].
 * `onDelete` 를 전달한 일반 가게에만 삭제 버튼을 표시한다.
 * `onSelect` 를 주면 본문 전체를 덮는 오버레이 버튼이 생긴다(가게명이 접근성 이름) —
 * 수정·삭제 버튼은 오버레이 위(z)로 올라가 있어 탭 대상에서 제외된다.
 */
export function StoreCard({
  founded,
  name,
  address,
  category,
  primary = false,
  onSelect,
  onEdit,
  onDelete,
  className,
}: StoreCardProps) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-2.5 border-b border-gray-100 bg-white px-5 py-4',
        className,
      )}
    >
      {onSelect && (
        <button
          type="button"
          aria-label={name}
          onClick={onSelect}
          className="absolute inset-0 cursor-pointer active:bg-gray-900/5"
        />
      )}

      {primary && (
        <p className="relative text-caption-l-semibold text-orange-500">현재 대표 위치</p>
      )}

      <div className="flex w-full items-start gap-3">
        <Building aria-hidden className="size-6 shrink-0 text-gray-600" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-caption-l-regular text-gray-500">{founded}</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-body-l-semibold text-gray-900">{name}</span>
              <span className="text-body-m-regular text-gray-700">{address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {category && <Tag>{category}</Tag>}
            {/* 수정·삭제는 오버레이 위(relative)로 올려 본문 탭 대상에서 제외 */}
            <div className="relative ml-auto flex items-center gap-2">
              <OutlineButton onClick={onEdit}>수정</OutlineButton>
              {!primary && onDelete && <OutlineButton onClick={onDelete}>삭제</OutlineButton>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
