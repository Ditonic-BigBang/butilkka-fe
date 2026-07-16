import type { Meta, StoryObj } from '@storybook/react-vite'
import { InstallSheet } from './InstallSheet'

/** "홈 화면에 추가" 유도 시트 — 플랫폼별 분기(Android 네이티브 설치 / iOS 수동 안내). */
const meta = {
  title: 'Widgets/PwaInstall',
  component: InstallSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '발표 데모용 **홈 화면 추가 유도 시트**. 로그인 앞에서 딤 배경 위 하단 시트로 뜬다.',
          '',
          '- **android**: 오렌지 CTA 탭 → Chrome **네이티브 설치 시트**(브라우저 OS UI, 커스텀 불가)',
          '- **ios**: 애플이 자동 설치를 막아 **공유 → 홈 화면에 추가** 수동 안내만',
          '',
          '표시 여부·플랫폼 판별은 `usePwaInstall` 이 담당하며, 이미 설치(standalone)·닫음 시엔 숨는다.',
        ].join('\n'),
      },
    },
  },
  args: {
    onInstall: () => {},
    onDismiss: () => {},
  },
  argTypes: {
    platform: { control: 'inline-radio', options: ['android', 'ios'] },
  },
} satisfies Meta<typeof InstallSheet>

export default meta
type Story = StoryObj<typeof meta>

/** Android — "홈 화면에 추가" 버튼 → Chrome 네이티브 설치 시트로 이어진다. */
export const Android: Story = { args: { platform: 'android' } }

/** iOS — 네이티브 설치 API 가 없어 공유 → 홈 화면에 추가 수동 안내. */
export const IOS: Story = { args: { platform: 'ios' } }
