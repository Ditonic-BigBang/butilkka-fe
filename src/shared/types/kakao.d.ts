declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLng): void
      getCenter(): LatLng
      setLevel(level: number, options?: { animate?: boolean }): void
      getLevel(): number
      /** 부드럽게 중심 이동 (픽셀 거리가 크면 즉시 이동) */
      panTo(latlng: LatLng): void
      /** 드래그 이동 허용 여부 (프리뷰 지도는 false) */
      setDraggable(draggable: boolean): void
      /** 스크롤 줌 허용 여부 (프리뷰 지도는 false) */
      setZoomable(zoomable: boolean): void
    }

    interface MapOptions {
      center: LatLng
      level: number
      /** 드래그 이동 허용 여부 (기본 true) */
      draggable?: boolean
    }

    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }

    class Polygon {
      constructor(options: PolygonOptions)
      setMap(map: Map | null): void
      getMap(): Map | null
      setOptions(options: Partial<PolygonOptions>): void
      setPath(path: LatLng[]): void
      getPath(): LatLng[]
    }

    interface PolygonOptions {
      map?: Map
      path: LatLng[]
      strokeWeight?: number
      strokeColor?: string
      strokeOpacity?: number
      fillColor?: string
      fillOpacity?: number
      zIndex?: number
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions)
      setMap(map: Map | null): void
      setPosition(position: LatLng): void
      setContent(content: string | HTMLElement): void
      setVisible(visible: boolean): void
    }

    interface CustomOverlayOptions {
      map?: Map
      position: LatLng
      content: string | HTMLElement
      xAnchor?: number
      yAnchor?: number
      zIndex?: number
      /** true 면 오버레이 클릭 시 지도 클릭 이벤트가 발생하지 않음 */
      clickable?: boolean
    }

    namespace event {
      function addListener(
        target: Map | Polygon | Marker,
        type: string,
        handler: (...args: unknown[]) => void,
      ): void
      function removeListener(
        target: Map | Polygon | Marker,
        type: string,
        handler: (...args: unknown[]) => void,
      ): void
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
    }

    interface MarkerOptions {
      map?: Map
      position: LatLng
    }

    // ── services (주소 검색·역지오코딩) — SDK URL 에 libraries=services 필요 ──
    namespace services {
      const Status: {
        OK: 'OK'
        ZERO_RESULT: 'ZERO_RESULT'
        ERROR: 'ERROR'
      }
      type StatusValue = 'OK' | 'ZERO_RESULT' | 'ERROR'

      /** 도로명 주소 상세 */
      interface RoadAddress {
        address_name: string
        building_name: string
      }

      /** 지번 주소 상세 */
      interface Address {
        address_name: string
      }

      /** addressSearch 결과 항목 */
      interface AddressSearchResult {
        /** 대표 주소 문자열 */
        address_name: string
        /** 경도 */
        x: string
        /** 위도 */
        y: string
        road_address: RoadAddress | null
        address: Address | null
      }

      /** coord2Address 결과 항목 */
      interface Coord2AddressResult {
        road_address: RoadAddress | null
        address: Address
      }

      class Geocoder {
        addressSearch(
          query: string,
          callback: (result: AddressSearchResult[], status: StatusValue) => void,
        ): void
        coord2Address(
          lng: number,
          lat: number,
          callback: (result: Coord2AddressResult[], status: StatusValue) => void,
        ): void
      }

      /** 장소(키워드) 검색 결과 항목 */
      interface PlaceSearchResult {
        /** 카카오 장소 고유 ID */
        id: string
        place_name: string
        /** 지번 주소 */
        address_name: string
        /** 도로명 주소 (없으면 빈 문자열) */
        road_address_name: string
        /** 경도 */
        x: string
        /** 위도 */
        y: string
      }

      class Places {
        constructor()
        keywordSearch(
          keyword: string,
          callback: (result: PlaceSearchResult[], status: StatusValue) => void,
        ): void
      }
    }
  }
}
