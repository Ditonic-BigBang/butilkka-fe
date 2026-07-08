import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { CTA, SelectButton, Tag } from '@/shared/ui'
import { FALLBACK_CATEGORIES, getCategories, storeKeys, useMyStores } from '@/entities/store'
import { useUpdateStoreCategory } from './model/useUpdateStoreCategory'

/**
 * 업종 설정 (Figma: [4-6] 업종변경 301:7732 · API: PATCH /users/me/stores/{id}).
 * 마이페이지 업종 행 → 진입. 현재 업종 표시 + 업종 2열 그리드에서 새 업종 선택 →
 * "다음" 으로 대표 가게 업종을 변경하고 마이페이지로("업종이 변경되었습니다." 토스트).
 */
export default function MyCategoryPage() {
  const navigate = useNavigate()
  const stores = useMyStores()
  const primary = stores.data?.find((s) => s.isPrimary)
  const { data } = useQuery({
    queryKey: storeKeys.categories(),
    queryFn: getCategories,
    staleTime: Infinity, // 업종 목록은 세션 내 불변
  })
  const categories = data ?? FALLBACK_CATEGORIES
  const update = useUpdateStoreCategory()
  const [selected, setSelected] = useState<string | null>(null)

  // 대표 가게가 없으면(온보딩 미완료 등) 마이페이지로
  if (!stores.isPending && !primary) return <Navigate to="/my" replace />

  const canSave = !!selected && !!primary && !update.isPending

  const handleSave = () => {
    if (!selected || !primary || update.isPending) return
    update.mutate(
      { storeId: primary.storeId, categoryCode: selected },
      {
        onSuccess: () =>
          navigate('/my', { replace: true, state: { toast: '업종이 변경되었습니다.' } }),
      },
    )
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        <GNB title="업종 설정" showSettings={false} onBack={() => navigate(-1)} />

        <div className="p-5">
          <h1 className="text-title-m-semibold whitespace-pre-line text-gray-900">
            {'본인의 가게 업종을\n선택해주세요'}
          </h1>
        </div>

        <div className="flex flex-1 flex-col gap-4 px-5 pt-10">
          {/* 현재 업종 */}
          {primary?.categoryName && (
            <div className="flex items-center gap-2 rounded-12 bg-orange-10 p-4">
              <span className="text-body-l-semibold text-gray-800">현재 업종</span>
              <Tag>{primary.categoryName}</Tag>
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

        <CTA disabled={!canSave} onClick={handleSave}>
          다음
        </CTA>
      </div>
    </MobileLayout>
  )
}
