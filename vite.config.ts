import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import { rm } from 'node:fs/promises'
import type { Plugin } from 'vite'

function removeProductionMswWorker(): Plugin {
  return {
    name: 'remove-production-msw-worker',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      await rm(fileURLToPath(new URL('./dist/mockServiceWorker.js', import.meta.url)), {
        force: true,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    // PWA: 서비스워커(자동 업데이트) + 매니페스트 + 아이콘/스플래시 자동 생성.
    // - devOptions.enabled=false → dev 에선 SW 미등록 (MSW 워커와 충돌 방지)
    // - pwaAssets.config → pwa-assets.config.ts 로 아이콘·스플래시 생성 후 head/매니페스트에 자동 주입
    // Storybook·Vitest 는 이 플러그인을 제외한다(.storybook/main.ts · vitest.config.ts).
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      pwaAssets: {
        config: true,
        overrideManifestIcons: true,
      },
      manifest: {
        id: '/',
        name: '버틸까',
        short_name: '버틸까',
        description: '버틸까 — 상권 쇠퇴 분석 모바일 웹앱',
        lang: 'ko',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        // 런칭(스플래시) 배경은 브랜드 오렌지, 앱 사용 중 상태바는 흰 GNB 와 맞춰 흰색.
        background_color: '#FF621B',
        theme_color: '#ffffff',
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 500 * 1024,
        // 앱 진입 셸과 공통 CSS, 단일 56KB 지도 geometry만 설치 시 선캐시한다.
        // rolldown-runtime·preload-helper: PDF lazy 청크 도입으로 분리된 entry 정적 의존성 (수 KB)
        globPatterns: [
          'index.html',
          'registerSW.js',
          'assets/index-*.js',
          'assets/jsx-runtime-*.js',
          'assets/rolldown-runtime-*.js',
          'assets/preload-helper-*.js',
          'assets/index-*.css',
          'seoul-gu.geojson',
        ],
        runtimeCaching: [
          {
            urlPattern: /\.geojson$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'geojson-cache',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // 라우트·그래프 청크는 처음 방문할 때만 저장하고 이후 시연에서 재사용한다.
            urlPattern: /\/assets\/.*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'visited-page-chunks',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/assets\/.*\.(?:png|jpe?g|svg|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'visited-page-assets',
              expiration: { maxEntries: 96, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    // public/의 MSW worker는 로컬 개발 전용이며 프로덕션 산출물에는 남기지 않는다.
    removeProductionMswWorker(),
  ],
  build: {
    manifest: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
