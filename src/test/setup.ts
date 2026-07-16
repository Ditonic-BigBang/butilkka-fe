// jest-dom 매처(toBeInTheDocument 등)를 Vitest 의 expect 에 등록.
// globals: true 라서 RTL 의 afterEach(cleanup) 도 자동 적용된다.
import '@testing-library/jest-dom/vitest'

// globals:true 라 beforeAll/afterEach/afterAll 은 전역에 있지만,
// 명시성·타입 안정성을 위해 'vitest' 에서 직접 import 한다.
import { beforeAll, afterEach, afterAll } from 'vitest'
import { isCommonAssetRequest } from 'msw'
import { server } from '@/shared/api/mocks/server'

// 전체 테스트 시작 전 1회: 요청 인터셉트 시작.
// 핸들러 없는 요청은 에러로 처리(누락된 mock 을 즉시 발견).
// 단, 정적 에셋과 public/seoul-gu.geojson 은 통과시킨다.
beforeAll(() => {
  server.listen({
    onUnhandledRequest(request, print) {
      if (isCommonAssetRequest(request)) return
      if (new URL(request.url).pathname.endsWith('.geojson')) return
      print.error()
    },
  })
})

// 각 테스트 후: 런타임 핸들러(server.use(...)) 초기화 → 테스트 간 격리.
afterEach(() => {
  server.resetHandlers()
})

// 전체 테스트 종료 후: 인터셉트 정리.
afterAll(() => {
  server.close()
})
