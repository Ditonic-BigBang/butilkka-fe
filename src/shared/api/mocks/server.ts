// MSW v2 Node server — Vitest(jsdom) 환경에서 요청을 가로챈다.
// v2 에서 setupServer 는 'msw/node' 엔트리포인트에 있다.
import { setupServer } from 'msw/node'
import { handlers } from '@/shared/api/mocks/handlers'

// 브라우저 worker 와 동일한 handlers 를 공유한다.
// 라이프사이클(listen/resetHandlers/close)은 src/test/setup.ts 에서 관리한다.
export const server = setupServer(...handlers)
