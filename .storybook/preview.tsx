/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite'
import '../src/index.css' // 디자인 토큰(@theme) + Tailwind 를 스토리에 주입

// 모바일 앱이라 스토리를 폰 크기로 렌더 (Figma: iPhone 16 = 393×852 / MobileLayout: max-w-430)
const MOBILE_VIEWPORTS = {
  iphone16: {
    name: 'iPhone 16 (393×852)',
    styles: { width: '393px', height: '852px' },
    type: 'mobile',
  },
  mobile430: {
    name: 'Mobile (430×932)',
    styles: { width: '430px', height: '932px' },
    type: 'mobile',
  },
}

const preview: Preview = {
  // 모든 컴포넌트에 Props 표·예제가 붙은 'Docs' 탭 자동 생성 (addon-docs)
  tags: ['autodocs'],
  parameters: {
    viewport: { options: MOBILE_VIEWPORTS },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  // 기본 뷰포트 = iPhone 16 → 모든 스토리가 폰 폭으로 렌더됨
  initialGlobals: {
    viewport: { value: 'iphone16', isRotated: false },
  },
}

export default preview
