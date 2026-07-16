import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/shared/api/queryClient'
import './index.css'
import App from './App.tsx'

// 개발 모드 + VITE_ENABLE_MSW=true 일 때만 MSW worker 를 시작한다.
// import.meta.env.DEV 가 프로덕션에서 false 로 치환되어 MSW import/chunk 자체가 제거된다.
async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== 'true') return

  const { worker } = await import('@/shared/api/mocks/browser')
  const { isCommonAssetRequest } = await import('msw')

  // worker 가 활성화된 뒤 resolve → 첫 요청부터 인터셉트 보장.
  await worker.start({
    onUnhandledRequest(request, print) {
      // Vite 에셋(/@vite, /src/*, 이미지·폰트 등)은 통과 — 콘솔 경고 폭주 방지.
      if (isCommonAssetRequest(request)) return
      // public/seoul-gu.geojson 같은 정적 파일도 통과(.geojson 은 위 함수가 못 잡음).
      if (new URL(request.url).pathname.endsWith('.geojson')) return
      // 그 외 핸들러 없는 요청만 경고 → 빠뜨린 mock 을 발견.
      print.warning()
    },
    // Vite 의 base 를 따라 worker URL 구성(기본 '/').
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}

// worker 시작이 실패해도 앱은 정상 렌더(빈 화면 방지).
enableMocking()
  .catch((error: unknown) => {
    console.error('[msw] worker 시작 실패 — mock 없이 계속합니다.', error)
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          {/* devtools는 프로덕션 번들에서 자동으로 제외됨 */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </StrictMode>,
    )
  })
