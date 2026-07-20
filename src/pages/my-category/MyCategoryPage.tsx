import { Navigate, useNavigate } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { Bone } from '@/shared/ui'
import { CategorySelect, useMyStores, type Category } from '@/entities/store'
import { useUpdateStoreCategory } from './model/useUpdateStoreCategory'

/**
 * 업종 설정 (Figma: [4-5] 업종선택 301:7732 · API: PATCH /users/me/stores/{id}).
 * 마이페이지 업종 행 → 진입. 현재 업종 표시 + 업종 2열 그리드에서 새 업종 선택 →
 * "다음" 으로 대표 가게 업종을 변경하고 마이페이지로("업종이 변경되었습니다." 토스트).
 */
export default function MyCategoryPage() {
  const navigate = useNavigate()
  const stores = useMyStores()
  const primary = stores.data?.find((s) => s.isPrimary)
  const update = useUpdateStoreCategory()

  // 대표 가게가 없으면(온보딩 미완료 등) 마이페이지로
  if (!stores.isPending && !primary) return <Navigate to="/my" replace />

  const handleComplete = (category: Category) => {
    if (!primary || update.isPending) return
    update.mutate(
      { storeId: primary.storeId, categoryCode: category.categoryCode },
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
        {/* 대표 가게(primary) 로드 후에만 선택 UI 노출 — 확정 대상이 확정된 뒤 CTA 활성 */}
        {primary ? (
          <CategorySelect
            currentCategoryName={primary.categoryName}
            pending={update.isPending}
            onComplete={handleComplete}
          />
        ) : (
          <CategorySkeleton />
        )}
      </div>
    </MobileLayout>
  )
}

/** 로딩 스켈레톤 — 타이틀 + 현재 업종 + 업종 그리드 자리 */
export function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <Bone className="h-6 w-44" />
      <Bone className="mt-6 h-14 w-full rounded-12" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Bone key={i} className="h-14 rounded-8" />
        ))}
      </div>
    </div>
  )
}
