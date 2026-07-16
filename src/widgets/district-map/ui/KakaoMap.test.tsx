import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import KakaoMap, { type MapMarker } from './KakaoMap'

vi.mock('@/shared/lib/useKakaoMapsSDK', () => ({
  useKakaoMapsSDK: () => ({ isLoaded: true, error: null }),
}))

const FIRST_MARKERS: MapMarker[] = [
  { id: '강남구', lat: 37.5, lng: 127, title: '강남구', caption: 'A등급' },
  { id: '마포구', lat: 37.55, lng: 126.9, title: '마포구', caption: 'B등급' },
]

type OverlayInstance = {
  setMap: ReturnType<typeof vi.fn>
  setPosition: ReturnType<typeof vi.fn>
}

let overlayConstructor = vi.fn<(options: unknown) => void>()
let overlayInstances: OverlayInstance[]
let addListener = vi.fn<(...args: unknown[]) => void>()
let removeListener = vi.fn<(...args: unknown[]) => void>()

beforeEach(() => {
  overlayConstructor = vi.fn<(options: unknown) => void>()
  overlayInstances = []
  addListener = vi.fn<(...args: unknown[]) => void>()
  removeListener = vi.fn<(...args: unknown[]) => void>()

  class FakeLatLng {
    private readonly lat: number
    private readonly lng: number

    constructor(lat: number, lng: number) {
      this.lat = lat
      this.lng = lng
    }

    getLat() {
      return this.lat
    }

    getLng() {
      return this.lng
    }
  }

  class FakeMap {
    setLevel = vi.fn()
    panTo = vi.fn()
    setCenter = vi.fn()
    panBy = vi.fn()
    getProjection = () => ({
      pointFromCoords: (point: FakeLatLng) => ({ x: point.getLng(), y: point.getLat() }),
    })
  }

  class FakeCustomOverlay {
    setMap = vi.fn()
    setPosition = vi.fn()

    constructor(options: unknown) {
      overlayConstructor(options)
      overlayInstances.push(this)
    }
  }

  class FakePolygon {
    setMap = vi.fn()
  }

  globalThis.kakao = {
    maps: {
      Map: FakeMap,
      LatLng: FakeLatLng,
      CustomOverlay: FakeCustomOverlay,
      Polygon: FakePolygon,
      event: { addListener, removeListener },
    },
  } as unknown as typeof kakao
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('KakaoMap overlay lifecycle', () => {
  it('같은 marker ID의 overlay와 지도 click listener를 재사용한다', async () => {
    const onMarkerClick = vi.fn()
    const view = render(<KakaoMap markers={FIRST_MARKERS} onMarkerClick={onMarkerClick} />)

    await waitFor(() => expect(overlayConstructor).toHaveBeenCalledTimes(2))
    expect(addListener).toHaveBeenCalledTimes(1)

    view.rerender(
      <KakaoMap
        markers={FIRST_MARKERS.map((marker) => ({ ...marker, caption: '갱신됨' }))}
        onMarkerClick={vi.fn()}
      />,
    )

    expect(overlayConstructor).toHaveBeenCalledTimes(2)
    expect(addListener).toHaveBeenCalledTimes(1)
    expect(overlayInstances[0].setPosition).not.toHaveBeenCalled()

    view.rerender(
      <KakaoMap
        markers={FIRST_MARKERS.map((marker, index) =>
          index === 0 ? { ...marker, lat: marker.lat + 0.01 } : marker,
        )}
        onMarkerClick={vi.fn()}
      />,
    )

    expect(overlayConstructor).toHaveBeenCalledTimes(2)
    expect(overlayInstances[0].setPosition).toHaveBeenCalledTimes(1)
    expect(addListener).toHaveBeenCalledTimes(1)
  })

  it('사라진 ID만 제거하고 새 ID만 생성한다', async () => {
    const view = render(<KakaoMap markers={FIRST_MARKERS} />)
    await waitFor(() => expect(overlayConstructor).toHaveBeenCalledTimes(2))

    view.rerender(
      <KakaoMap
        markers={[FIRST_MARKERS[0], { id: '종로구', lat: 37.57, lng: 126.98, title: '종로구' }]}
      />,
    )

    expect(overlayConstructor).toHaveBeenCalledTimes(3)
    expect(overlayInstances[1].setMap).toHaveBeenCalledWith(null)
  })
})
