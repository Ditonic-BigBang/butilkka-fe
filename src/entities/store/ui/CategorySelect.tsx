import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CTA, SelectButton, Tag } from '@/shared/ui'
import { FALLBACK_CATEGORIES, type Category } from '../model/types'
import { getCategories, storeKeys } from '../api/storeApi'

type CategorySelectProps = {
  /** 현재 설정된 업종명 — 있으면 상단 "현재 업종" 박스 표시 */
  currentCategoryName?: string
  /** "다음" 확정 시 선택한 업종(code+name) */
  onComplete: (category: Category) => void
  /** CTA 비활성(저장 진행 중 등) */
  pending?: boolean
}

/**
 * 업종 선택 화면 본문 (Figma: [4-5] 업종선택 301:7732).
 * 타이틀 + 현재 업종 + 2열 그리드 + "다음" CTA. 그리드에서 하나 고른 뒤 "다음"으로 확정한다.
 * (즉시 반영이 아니라 select-then-confirm) GNB/레이아웃은 호출 측에서 감싼다.
 * 업종 설정 페이지(MyCategoryPage)와 가게 추가/수정 폼의 업종 선택 서브뷰가 공유.
 */
export function CategorySelect({ currentCategoryName, onComplete, pending }: CategorySelectProps) {
  const { data } = useQuery({
    queryKey: storeKeys.categories(),
    queryFn: getCategories,
    staleTime: Infinity, // 업종 목록은 세션 내 불변
  })
  const categories = data ?? FALLBACK_CATEGORIES
  const [selected, setSelected] = useState<string | null>(null)

  const handleNext = () => {
    if (!selected || pending) return
    const category = categories.find((c) => c.categoryCode === selected)
    if (category) onComplete(category)
  }

  return (
    <>
      <div className="p-5">
        <h1 className="text-title-m-semibold whitespace-pre-line text-gray-900">
          {'본인의 가게 업종을\n선택해주세요'}
        </h1>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pt-10">
        {/* 현재 업종 */}
        {currentCategoryName && (
          <div className="flex items-center gap-2 rounded-12 bg-orange-10 p-4">
            <span className="text-body-l-semibold text-gray-800">현재 업종</span>
            <Tag>{currentCategoryName}</Tag>
          </div>
        )}

        {/* 업종 2열 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <SelectButton
              key={category.categoryCode}
              selected={selected === category.categoryCode}
              onClick={() => setSelected(category.categoryCode)}
              className="w-full"
            >
              {category.categoryName}
            </SelectButton>
          ))}
        </div>
      </div>

      <CTA disabled={!selected || pending} onClick={handleNext}>
        다음
      </CTA>
    </>
  )
}
