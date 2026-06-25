// jest-dom 매처(toBeInTheDocument 등)를 Vitest 의 expect 에 등록.
// globals: true 라서 RTL 의 afterEach(cleanup) 도 자동 적용된다.
import '@testing-library/jest-dom/vitest'
