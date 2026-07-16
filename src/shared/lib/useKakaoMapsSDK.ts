import { useEffect, useState } from 'react'

// services: 주소 검색(Geocoder) — 온보딩·가게위치 변경에서 사용
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`

let kakaoSdkPromise: Promise<void> | null = null

function resolveKakaoReady(resolve: () => void, reject: (reason: Error) => void) {
  if (typeof kakao === 'undefined' || !kakao.maps) {
    reject(new Error('카카오맵 SDK를 초기화하지 못했습니다.'))
    return
  }
  kakao.maps.load(resolve)
}

/** 여러 화면이 동시에 요청해도 SDK script와 maps.load 콜백은 하나만 만든다. */
export function loadKakaoMapsSDK(): Promise<void> {
  if (kakaoSdkPromise) return kakaoSdkPromise

  kakaoSdkPromise = new Promise<void>((resolve, reject) => {
    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(resolve)
      return
    }

    if (!import.meta.env.VITE_KAKAO_JS_KEY) {
      reject(new Error('.env 파일에 VITE_KAKAO_JS_KEY를 설정해주세요.'))
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com"]',
    )
    const script = existingScript ?? document.createElement('script')

    script.addEventListener('load', () => resolveKakaoReady(resolve, reject), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('카카오맵 SDK 로드에 실패했습니다. API 키를 확인해주세요.')),
      { once: true },
    )

    if (!existingScript) {
      script.src = KAKAO_SDK_URL
      script.async = true
      document.head.appendChild(script)
    }
  })

  return kakaoSdkPromise
}

export function useKakaoMapsSDK() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadKakaoMapsSDK()
      .then(() => {
        if (!cancelled) setIsLoaded(true)
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : '카카오맵 SDK 로드에 실패했습니다.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { isLoaded, error }
}
