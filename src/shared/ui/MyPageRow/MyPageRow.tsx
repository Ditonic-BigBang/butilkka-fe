import ChevronRight from '~icons/ci/chevron-right'
import { cn } from '@/shared/lib/cn'

type MyPageRowProps = {
  /** 좌측 아이콘 (예: 태그·빌딩) */
  icon?: React.ReactNode
  /** 좌측 라벨 (예: "업종") — semibold gray-900 */
  label?: string
  /** 우측 콘텐츠 (칩 · 2줄 텍스트 등) */
  children?: React.ReactNode
  onClick?: () => void
  className?: string
}

/**
 * 마이페이지 리스트 행 (Figma: List_M 427:18736).
 * 흰 배경 · px-16 py-20. 좌측 [아이콘 + 라벨 + 콘텐츠(칩·2줄 등)] · 우측 chevron. 탭 시 이동.
 * 콘텐츠는 `children` 슬롯 — 업종 칩, 가게명+주소 2줄 등 자유 구성.
 */
export function MyPageRow({ icon, label, children, onClick, className }: MyPageRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 bg-white px-4 py-5 text-left',
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon}
        {label && <span className="shrink-0 text-body-l-semibold text-gray-900">{label}</span>}
        {children}
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-200" />
    </button>
  )
}
