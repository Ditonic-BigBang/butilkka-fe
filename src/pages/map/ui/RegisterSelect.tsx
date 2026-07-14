import ChevronLeft from '~icons/ci/chevron-left'
import { CTA } from '@/shared/ui'

type RegisterSelectProps = {
  /** 지도에서 고른 구 — 아직 없으면 안내 문구 표시 */
  district: string | null
  onBack: () => void
  /** 하단 CTA "선택" — 구가 골라졌을 때만 노출 */
  onConfirm: () => void
}

/**
 * 즐겨찾기 "지도에서 선택" 모드 (Figma: 지도 - 검색시 257:7523).
 * 상단 바(‹ + 선택한 구) + 하단 확정 시트(서울 {구} + 선택 CTA).
 * 지도 조작·구 판정은 MapPage 가 담당, 여기는 오버레이 UI 만.
 */
export function RegisterSelect({ district, onBack, onConfirm }: RegisterSelectProps) {
  return (
    <>
      {/* 상단 선택 바 — 검색바와 같은 모양이지만 입력이 아닌 표시용 */}
      <div className="absolute inset-x-0 top-0 z-20 bg-white px-5 pt-4 pb-4 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex h-12 w-full items-center gap-2.5 rounded-8 bg-gray-70 px-4">
          <button type="button" aria-label="뒤로" onClick={onBack} className="shrink-0">
            <ChevronLeft aria-hidden className="size-6 text-gray-600" />
          </button>
          {district ? (
            <span className="text-body-l-medium text-gray-900">{district}</span>
          ) : (
            <span className="text-body-l-medium font-normal text-gray-300">
              지도에서 구를 선택하세요
            </span>
          )}
        </div>
      </div>

      {/* 하단 확정 시트 */}
      {district && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 rounded-t-[20px] bg-white pt-4 shadow-upper">
          <p className="py-3 text-title-s-semibold text-gray-900">서울 {district}</p>
          <CTA onClick={onConfirm}>선택</CTA>
        </div>
      )}
    </>
  )
}
