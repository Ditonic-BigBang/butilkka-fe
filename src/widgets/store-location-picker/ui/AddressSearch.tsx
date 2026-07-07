import { useState } from 'react'
import Compass from '~icons/ci/compass'
import { GNB } from '@/widgets/mobile-layout'
import { AddressItem, SearchInput } from '@/shared/ui'
import type { StoreLocation } from '@/entities/store'
import { useAddressSearch, coordToLocation } from '../model/useAddressSearch'

const SEARCH_TIPS = [
  { label: '도로명 + 건물번호', example: '예) 명동10길 52' },
  { label: '지역명(동/리) + 번지', example: '예) 충무로2가 65-4' },
  { label: '지역명(동/리) + 건물명(아파트명)', example: '예) 명동 신한 익스페이스' },
] as const

type AddressSearchProps = {
  onSelect: (location: StoreLocation) => void
  onBack?: () => void
  /** 카카오맵 SDK(services) 로드 여부 */
  sdkReady: boolean
}

/**
 * 주소 검색 화면 (Figma: 가게위치 변경하기/4·5 — 446:21435 / 446:21470).
 * 검색바 + 현위치로 설정하기 → 검색 전에는 검색 팁, 입력하면 주소 결과 리스트.
 */
export function AddressSearch({ onSelect, onBack, sdkReady }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const { results, searched } = useAddressSearch(query, sdkReady)

  const useCurrentLocation = () => {
    if (locating || !sdkReady) return
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError('이 브라우저에서는 현재 위치를 사용할 수 없어요.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const location = await coordToLocation(coords.latitude, coords.longitude)
        setLocating(false)
        if (location) onSelect(location)
        else setGeoError('현재 위치의 주소를 찾지 못했어요.')
      },
      () => {
        setLocating(false)
        setGeoError('위치 권한을 허용해주세요.')
      },
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <GNB title="주소 검색" showSettings={false} onBack={onBack} />

      {/* 검색바 + 현위치 — onBack 없음: 주소 검색은 포커스에도 돋보기 유지 (Figma 446:21470) */}
      <div className="flex flex-col gap-4 px-5 py-3">
        <SearchInput value={query} onChange={setQuery} placeholder="도로명 또는 지번 입력" />
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1.5 self-start disabled:opacity-50"
        >
          <Compass aria-hidden className="size-5 shrink-0 text-gray-600" />
          <span className="text-body-m-regular text-gray-600">
            {locating ? '현재 위치 찾는 중…' : '현위치로 설정하기'}
          </span>
        </button>
        {geoError && <p className="text-caption-l-regular text-status-red">{geoError}</p>}
      </div>

      <div className="h-2.5 shrink-0 bg-gray-70" />

      {results.length > 0 ? (
        // 검색 결과 — 주소 결과: 도로명 + [지번] 지번주소 · 장소 결과: 장소명 + 도로명주소
        <ul>
          {/* key: 장소는 카카오 장소 ID, 주소는 좌표(dedupe 로 유일 보장) */}
          {results.map(({ id, placeName, location }) => (
            <li key={id ?? `${location.lat},${location.lng}`}>
              <AddressItem
                address={placeName ?? location.roadAddress}
                badge={placeName ? undefined : location.jibunAddress && '지번'}
                subAddress={placeName ? location.roadAddress : location.jibunAddress}
                onClick={() => onSelect(location)}
              />
            </li>
          ))}
        </ul>
      ) : searched ? (
        // 결과 없음
        <p className="px-5 py-10 text-center text-body-m-regular text-gray-400">
          검색 결과가 없어요. 주소를 다시 확인해주세요.
        </p>
      ) : (
        // 검색 팁 (Figma 446:21446)
        <div className="flex flex-col gap-5 p-5">
          <p className="text-body-l-medium text-gray-700">이렇게 검색해 보세요</p>
          <ul className="flex flex-col gap-3.5">
            {SEARCH_TIPS.map((tip) => (
              <li key={tip.label} className="flex gap-1.5">
                <span
                  aria-hidden
                  className="mt-[7px] size-[3px] shrink-0 rounded-max bg-gray-700"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-body-m-medium text-gray-700">{tip.label}</p>
                  <p className="text-body-m-regular text-gray-300">{tip.example}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
