import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

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
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // 서울 자치구 경계(정적·대용량 1.2MB)는 런타임 캐시 → 재방문 즉시 로드 + 지도 부분 오프라인.
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
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
