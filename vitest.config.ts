import { defineConfig, mergeConfig } from 'vitest/config'
import type { PluginOption } from 'vite'
import viteConfig from './vite.config'

// vite.config 의 react 플러그인·@/ alias·tailwind 를 그대로 재사용한다.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// vite-plugin-pwa 는 앱 전용 — 테스트 실행에 서비스워커/매니페스트가 끼어들지 않게 제거.
const isPwaPlugin = (p: unknown): boolean =>
  !!p &&
  typeof p === 'object' &&
  'name' in p &&
  String((p as { name?: unknown }).name).startsWith('vite-plugin-pwa')

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const merged = mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: ['./src/test/setup.ts'],
            // CSS 처리는 기본 비활성(동작 테스트엔 불필요·빠름).
            // 계산된 스타일/CSS 변수까지 테스트하려면 css: true 추가.
          },
        },
        {
          extends: true,
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                {
                  browser: 'chromium',
                },
              ],
            },
          },
        },
      ],
    },
  }),
)

const flatPlugins = ((merged.plugins ?? []) as unknown[]).flat(Infinity) as unknown[]
merged.plugins = flatPlugins.filter((p) => !isPwaPlugin(p)) as PluginOption[]

export default merged
