import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Compass from '~icons/ci/compass'
import Search from '~icons/ci/search'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { StoreLocationPicker } from '@/widgets/store-location-picker'
import { ToastHost } from '@/shared/ui'
import { StoreCard, useMyStores, lookupRegion, type StoreLocation } from '@/entities/store'
import { useSetPrimaryStore } from './model/useSetPrimaryStore'
import { formatFounded } from './lib/storeFormat'

/**
 * 내 가게 설정 (Figma: [4-2] 가게위치 변경하기/2. 317:6772 · API: GET /api/v1/users/me/stores).
 * 마이페이지 가게 행 → 진입하는 상세 화면(하단 탭 없음).
 * 주소 검색·현위치 → 주소검색 화면(StoreLocationPicker) → 위치 확정 시 신규 등록 폼(/my/store/new)으로.
 * 등록된 가게 목록(StoreCard, 대표 가게 칩) — 행 본문 탭(수정·삭제 제외) 시 그 가게를 대표로 지정,
 * "수정" → 수정 폼(/my/store/:id/edit). 삭제는 미구현.
 */
export default function MyStorePage() {
  const navigate = useNavigate()
  const stores = useMyStores()
  const setPrimary = useSetPrimaryStore()
  // null: 목록 · 'search': 주소검색부터 · 'current': 현위치로 바로 지도 확인
  const [picker, setPicker] = useState<'search' | 'current' | null>(null)

  // 위치 확정 → 상권코드 매핑 후 신규 등록 폼으로(목록 맨 뒤 추가).
  // 매핑 실패해도 등록 폼은 진행한다(폼에서 재선택 가능).
  const handleLocationComplete = (loc: StoreLocation) => {
    setPicker(null)
    void lookupRegion({ lat: loc.lat, lng: loc.lng })
      .then((regions) =>
        navigate('/my/store/new', {
          state: { location: loc, regionCode: regions[0]?.regionCode ?? '' },
        }),
      )
      .catch(() => navigate('/my/store/new', { state: { location: loc } }))
  }

  // 대표 지정 — 클릭 즉시 대표로 등록(백그라운드)하고 마이페이지로 돌아간다.
  const selectAsPrimary = (storeId: number) => {
    setPrimary.mutate(storeId)
    navigate('/my')
  }

  if (picker) {
    return (
      <MobileLayout showBottomTab={false}>
        <StoreLocationPicker
          cta="이 위치로 등록하기"
          startWithCurrentLocation={picker === 'current'}
          onClose={() => setPicker(null)}
          onComplete={handleLocationComplete}
        />
      </MobileLayout>
    )
  }

  let content
  if (stores.isPending) {
    content = <StoreListSkeleton />
  } else if (stores.isError) {
    content = (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-body-l-medium text-gray-500">가게 목록을 불러오지 못했어요</p>
        <button
          type="button"
          onClick={() => stores.refetch()}
          className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
        >
          다시 시도
        </button>
      </div>
    )
  } else if (stores.data.length === 0) {
    content = (
      <p className="flex items-center justify-center py-20 text-body-l-medium text-gray-400">
        등록된 가게가 없어요
      </p>
    )
  } else {
    content = (
      <ul>
        {stores.data.map((store) => (
          <li key={store.storeId}>
            <StoreCard
              founded={formatFounded(store.storeOpenDate)}
              name={store.storeName}
              address={store.address ?? store.regionName ?? ''}
              primary={store.isPrimary}
              onSelect={store.isPrimary ? undefined : () => selectAsPrimary(store.storeId)}
              onEdit={() => navigate(`/my/store/${store.storeId}/edit`)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        <GNB title="내 가게 설정" showSettings={false} onBack={() => navigate(-1)} />

        <div className="flex flex-col gap-4 px-5 py-3">
          {/* 검색바 → 주소검색부터, 현위치 → 현위치로 바로 지도 확인 (StoreLocationPicker) */}
          <button
            type="button"
            onClick={() => setPicker('search')}
            className="flex h-12 w-full items-center gap-2.5 rounded-8 bg-gray-70 px-4"
          >
            <Search aria-hidden className="size-6 shrink-0 text-gray-300" />
            <span className="text-body-l-regular text-gray-300">도로명 또는 지번 입력</span>
          </button>
          <button
            type="button"
            onClick={() => setPicker('current')}
            className="flex items-center gap-1.5 self-start"
          >
            <Compass aria-hidden className="size-5 text-gray-600" />
            <span className="text-body-m-regular text-gray-600">현위치로 설정하기</span>
          </button>
        </div>

        {content}

        {/* 등록 완료 등 라우트 토스트 (Figma 446:23137) */}
        <ToastHost />
      </div>
    </MobileLayout>
  )
}

/** 로딩 스켈레톤 — 가게 카드 형태 2줄 */
function StoreListSkeleton() {
  return (
    <ul className="flex flex-col">
      {[0, 1].map((i) => (
        <li key={i} className="flex gap-3 border-b border-gray-100 px-5 py-4">
          <div className="size-6 shrink-0 animate-pulse rounded-lg bg-gray-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        </li>
      ))}
    </ul>
  )
}
