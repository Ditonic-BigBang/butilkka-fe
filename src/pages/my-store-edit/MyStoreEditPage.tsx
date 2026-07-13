import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { StoreLocationPicker, LocationPreviewMap } from '@/widgets/store-location-picker'
import { CTA, TextField, DatePicker } from '@/shared/ui'
import {
  lookupRegion,
  CategorySelect,
  type Category,
  type MyStore,
  type StoreLocation,
  useMyStores,
} from '@/entities/store'
import { useUpdateStore } from './model/useUpdateStore'
import { useCreateStore } from './model/useCreateStore'

const NAME_MAX = 25

// draft 는 'YYYY-MM-DD' 문자열로 보관(서버 형식), DatePicker 와는 Date 로 교환
function toDate(value?: string): Date | undefined {
  return value ? new Date(`${value}T00:00:00`) : undefined
}
function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 내 가게 추가/수정 (Figma: [4-2] 가게위치 변경하기/3. 301:5536).
 * - 수정: `/my/store/:storeId/edit` — 목록에서 가게를 찾아 프리필 → PATCH
 * - 추가: `/my/store/new` — 주소검색에서 넘어온 위치로 시작 → 이름·창업일 입력 → POST(목록 맨 뒤)
 * 대상 가게는 목록(useMyStores)에서 찾는다(별도 상세 조회 API 없음).
 */
export default function MyStoreEditPage() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const stores = useMyStores()

  // 신규 등록 — 주소검색에서 넘어온 위치/상권코드로 시작
  if (!storeId) {
    const state = routerLocation.state as { location?: StoreLocation; regionCode?: string } | null
    return (
      <StoreForm
        mode="new"
        initialLocation={state?.location}
        initialRegionCode={state?.regionCode ?? ''}
      />
    )
  }

  // 수정 — 목록에서 대상 가게 찾기 (key 로 가게 바뀌면 폼 상태 새로 초기화)
  const store = stores.data?.find((s) => s.storeId === Number(storeId))
  if (store) return <StoreForm key={store.storeId} mode="edit" store={store} />

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        <GNB title="내 가게 설정" showSettings={false} onBack={() => navigate(-1)} />
        {stores.isPending ? (
          <EditSkeleton />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-body-l-medium text-gray-500">가게를 찾을 수 없어요</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
            >
              돌아가기
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

type StoreFormProps =
  | { mode: 'edit'; store: MyStore; initialLocation?: undefined; initialRegionCode?: undefined }
  | { mode: 'new'; store?: undefined; initialLocation?: StoreLocation; initialRegionCode?: string }

/** 가게 폼 — 추가(빈 값 + 넘어온 위치)/수정(기존 값) 공용. 지도 + 위치·이름·창업일 → 저장 */
function StoreForm({ mode, store, initialLocation, initialRegionCode }: StoreFormProps) {
  const navigate = useNavigate()
  const update = useUpdateStore()
  const create = useCreateStore()
  const pending = update.isPending || create.isPending

  const [location, setLocation] = useState<StoreLocation | undefined>(
    store?.address
      ? { roadAddress: store.address, lat: store.lat, lng: store.lng }
      : initialLocation,
  )
  const [regionCode, setRegionCode] = useState(store?.regionCode ?? initialRegionCode ?? '')
  const [name, setName] = useState(store?.storeName ?? '')
  const [foundedDate, setFoundedDate] = useState(store?.storeOpenDate ?? '')
  const [categoryCode, setCategoryCode] = useState(store?.categoryCode ?? '')
  const [categoryName, setCategoryName] = useState(store?.categoryName ?? '')
  const [picking, setPicking] = useState(false)
  const [pickingCategory, setPickingCategory] = useState(false)

  // 위치 확정 → 상권코드 재매핑 (저장 payload 에 regionCode 필요). 실패해도 진행은 막지 않는다.
  const completeLocation = (loc: StoreLocation) => {
    setLocation(loc)
    setPicking(false)
    void lookupRegion({ lat: loc.lat, lng: loc.lng })
      .then((regions) => {
        if (regions[0]) setRegionCode(regions[0].regionCode)
      })
      .catch(() => {
        // 매칭 상권 없음(404 등) — 기존 regionCode 유지
      })
  }

  // 업종 선택 → 폼 값 반영 후 폼으로 복귀 (라우트 이동 X — 폼 입력 유지)
  const completeCategory = (category: Category) => {
    setCategoryCode(category.categoryCode)
    setCategoryName(category.categoryName)
    setPickingCategory(false)
  }

  if (picking) {
    return (
      <MobileLayout showBottomTab={false}>
        <StoreLocationPicker
          cta="이 위치로 등록하기"
          onClose={() => setPicking(false)}
          onComplete={completeLocation}
        />
      </MobileLayout>
    )
  }

  if (pickingCategory) {
    return (
      <MobileLayout showBottomTab={false}>
        <div className="flex min-h-full flex-col bg-white">
          <GNB title="업종 설정" showSettings={false} onBack={() => setPickingCategory(false)} />
          <CategorySelect currentCategoryName={categoryName} onComplete={completeCategory} />
        </div>
      </MobileLayout>
    )
  }

  const canSave =
    !!location && name.trim().length > 0 && foundedDate.length > 0 && categoryCode.length > 0

  const handleSave = () => {
    if (!location || pending) return
    if (mode === 'edit') {
      update.mutate(
        {
          storeId: store.storeId,
          payload: {
            storeName: name.trim(),
            storeOpenDate: foundedDate,
            storeAddress: location.roadAddress,
            regionCode,
            categoryCode,
            lat: location.lat,
            lng: location.lng,
          },
        },
        { onSuccess: () => navigate(-1) },
      )
    } else {
      create.mutate(
        {
          regionCode,
          categoryCode,
          lat: location.lat,
          lng: location.lng,
          storeName: name.trim(),
          storeOpenDate: foundedDate,
          storeAddress: location.roadAddress,
        },
        // 내 가게 설정에서 하단 토스트로 표시할 메시지
        {
          onSuccess: () =>
            navigate('/my/store', {
              replace: true,
              state: { toast: '새로운 주소가 등록되었습니다.' },
            }),
        },
      )
    }
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        <GNB title="내 가게 설정" showSettings={false} onBack={() => navigate(-1)} />

        {/* 지도 프리뷰 */}
        <div className="flex flex-col gap-1 p-5">
          {location ? (
            <LocationPreviewMap
              lat={location.lat}
              lng={location.lng}
              onClick={() => setPicking(true)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="flex h-[124px] w-full items-center justify-center border border-gray-100 bg-gray-70 text-body-m-regular text-gray-400"
            >
              지도에서 위치를 선택해주세요
            </button>
          )}
          <p className="text-caption-l-regular text-gray-300">
            지도를 클릭하여 위치를 확인할 수 있습니다.
          </p>
        </div>

        {/* 편집 필드 */}
        <div className="flex flex-1 flex-col gap-6 px-5 pt-1">
          <Field label="가게 위치">
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="flex h-12 w-full items-center rounded-8 border border-gray-100 bg-white px-4 text-left text-body-l-regular"
            >
              <span className={location ? 'truncate text-gray-900' : 'text-gray-500'}>
                {location?.roadAddress ?? '가게 위치를 선택해주세요.'}
              </span>
            </button>
          </Field>

          <Field label="가게 이름">
            <TextField
              appearance="outlined"
              value={name}
              onChange={(v) => setName(v.slice(0, NAME_MAX))}
              placeholder="가게 이름을 입력해주세요."
            />
          </Field>

          <Field label="가게 창업 일시">
            <DatePicker
              appearance="outlined"
              value={toDate(foundedDate)}
              onChange={(date) => setFoundedDate(toDateString(date))}
              placeholder="창업일을 선택해주세요."
              title="창업일 선택"
            />
          </Field>

          <Field label="가게 업종">
            <button
              type="button"
              onClick={() => setPickingCategory(true)}
              className="flex h-12 w-full items-center rounded-8 border border-gray-100 bg-white px-4 text-left text-body-l-regular"
            >
              <span className={categoryName ? 'truncate text-gray-900' : 'text-gray-500'}>
                {categoryName || '업종을 선택해주세요.'}
              </span>
            </button>
          </Field>
        </div>

        <CTA disabled={!canSave || pending} onClick={handleSave}>
          주소 등록하기
        </CTA>
      </div>
    </MobileLayout>
  )
}

/** 라벨(gray-700 semibold 16px) + 필드 (gap-8) */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-l-semibold text-gray-700">{label}</p>
      {children}
    </div>
  )
}

/** 로딩 스켈레톤 — 지도 + 필드 3개 */
function EditSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="h-[124px] w-full animate-pulse bg-gray-100" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-12 w-full animate-pulse rounded-8 bg-gray-100" />
        </div>
      ))}
    </div>
  )
}
