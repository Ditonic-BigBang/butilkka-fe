import {
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

// PWA 아이콘 + iOS 스플래시 스크린 생성 규칙.
// vite-plugin-pwa 의 pwaAssets({ config: true }) 가 이 파일을 읽어 빌드 시 자동 생성·주입한다.
// 로고 확정 시 아래 `images` 소스(app-icon.svg)만 교체하면 전체 재생성됨.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    // iOS 는 manifest 를 안 읽어 기기별 정적 스플래시 이미지가 필요 → 전 기기 세트 생성.
    // 로고를 흰 배경 중앙에 배치(테마색 확정 시 background 교체).
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: { background: '#ffffff', fit: 'contain' },
      linkMediaOptions: { log: false, addMediaScreen: true, basePath: '/', xhtml: false },
      // 다크 스플래시는 미생성. 파일명은 light/dark 세그먼트를 빼지만 head <link> 생성기는
      // dark=false 를 boolean 으로 받아 '-light-' 를 붙여 불일치가 난다 → 세그먼트를 항상 빼서 일치시킴.
      name: (landscape, size) =>
        `apple-splash-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`,
    }),
  },
  images: ['public/app-icon.svg'],
})
