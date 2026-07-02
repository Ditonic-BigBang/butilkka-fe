import { createAppleSplashScreens, defineConfig } from '@vite-pwa/assets-generator/config'

// PWA 아이콘 + iOS 스플래시 스크린 생성 규칙.
// vite-plugin-pwa 의 pwaAssets({ config: true }) 가 이 파일을 읽어 빌드 시 자동 생성·주입한다.
// 소스(public/app-icon.svg)는 오렌지(#FF621B) 배경이 구워진 풀블리드 아이콘 → 로고 교체 시 그 파일만 바꾸면 전체 재생성.
const KEY = '#FF621B'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    // 홈 화면/일반 아이콘: 소스 그대로(풀블리드 오렌지 + 워드마크 88%).
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
    },
    // maskable: OS 마스크 안전영역(중앙 원) 확보 위해 살짝 축소 + 여백 오렌지 채움.
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: KEY },
    },
    // apple-touch-icon: iOS 가 모서리 라운딩 → 풀블리드 유지(흰 여백 X).
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: KEY },
    },
    // iOS 스플래시: 로고를 오렌지 배경 위 중앙 배치, 전 기기 세트 생성.
    // 다크 미생성 → 파일명/head href 일치 위해 light/dark 세그먼트 제거(name).
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.45,
      resizeOptions: { background: KEY, fit: 'contain' },
      linkMediaOptions: { log: false, addMediaScreen: true, basePath: '/', xhtml: false },
      name: (landscape, size) =>
        `apple-splash-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`,
    }),
  },
  images: ['public/app-icon.svg'],
})
