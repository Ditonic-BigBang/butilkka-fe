import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationPin from '~icons/ci/location'
import CloseSm from '~icons/ci/close-sm'
import AddPlusCircle from '~icons/ci/add-plus-circle'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { useFavorites, MAX_FAVORITES, type FavoriteItem } from '@/entities/favorite'
import { ConfirmPopup, Toast } from '@/shared/ui'
import { useTransientToast } from '@/shared/lib/useTransientToast'

/**
 * 즐겨찾는 지역 편집 (Figma: 지도 - 검색시 424:12134·257:9299·424:12198).
 * 지도 검색 화면의 "편집" 진입 — 목록(구 단위) + 행 ✕ 로 삭제(확인 팝업) + 추가 링크.
 */
export default function FavoriteRegionsPage() {
  const navigate = useNavigate()
  const { favorites, remove } = useFavorites()
  // 삭제 확인 팝업 대상 — null 이면 닫힘
  const [removeTarget, setRemoveTarget] = useState<FavoriteItem | null>(null)
  const { toast, closing: toastClosing, show: showToast } = useTransientToast()

  const confirmRemove = () => {
    if (!removeTarget) return
    remove(removeTarget.regionCode, { onSuccess: () => showToast('삭제되었습니다.') })
    setRemoveTarget(null)
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="relative flex h-full flex-col">
        <GNB
          title="즐겨찾는 지역"
          showBack={false}
          onClose={() => navigate('/map', { viewTransition: true })}
        />

        <div className="flex flex-col gap-4 p-5">
          {favorites.length > 0 && (
            <ul className="flex flex-col gap-2">
              {favorites.map((favorite) => (
                <li
                  key={favorite.regionCode}
                  className="flex items-center justify-between rounded-8 border border-gray-100 p-3"
                >
                  <span className="flex items-center gap-3">
                    <LocationPin aria-hidden className="size-6 text-orange-500" />
                    <span className="text-body-m-medium text-gray-900">
                      서울 {favorite.district}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`서울 ${favorite.district} 삭제`}
                    onClick={() => setRemoveTarget(favorite)}
                  >
                    <CloseSm aria-hidden className="size-6 text-gray-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {favorites.length >= MAX_FAVORITES ? (
            // 4개가 차면 추가 대신 안내 텍스트 (Figma 1462:14168)
            <p className="text-body-m-medium text-gray-400">최대 4개까지만 등록 가능합니다</p>
          ) : (
            <button
              type="button"
              // 추가 = 지도 검색의 즐겨찾기 등록 모드로 진입
              onClick={() => navigate('/map', { state: { registerFavorite: true } })}
              className="flex items-center gap-2 text-gray-300"
            >
              <AddPlusCircle aria-hidden className="size-5 shrink-0" />
              <span className="text-body-m-medium text-gray-400">즐겨찾는 지역 추가</span>
            </button>
          )}
        </div>

        <ConfirmPopup
          open={removeTarget !== null}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={confirmRemove}
        >
          <span className="font-semibold text-gray-900">서울 {removeTarget?.district}</span>를
          삭제하시겠습니까?
        </ConfirmPopup>

        {toast && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center px-5">
            <Toast className={toastClosing ? 'animate-toast-out' : 'animate-toast-in'}>
              {toast}
            </Toast>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
