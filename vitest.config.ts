import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// vite.config 의 react 플러그인·@/ alias·tailwind 를 그대로 재사용한다.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      // CSS 처리는 기본 비활성(동작 테스트엔 불필요·빠름).
      // 계산된 스타일/CSS 변수까지 테스트하려면 css: true 추가.
    },
  }),
)
