// MSW v2 브라우저 worker — 개발 환경 전용.
// v2 에서 setupWorker 는 'msw/browser' 엔트리포인트에 있다(v1 은 'msw' 에서 import 했음).
import { setupWorker } from 'msw/browser'
import { handlers } from '@/shared/api/mocks/handlers'

// worker.start() 옵션·게이팅은 main.tsx 의 enableMocking() 에서 처리한다.
export const worker = setupWorker(...handlers)
