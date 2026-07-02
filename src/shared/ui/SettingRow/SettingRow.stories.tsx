import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Toggle } from '../Toggle/Toggle'
import { SettingRow } from './SettingRow'

/** 설정/마이페이지 리스트 행. Figma: List_알림설정_마이페이지 286:5041. */
const meta = {
  title: 'UI/SettingRow',
  component: SettingRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '설정/마이페이지 리스트 행. **Figma:** `286:5041`',
          '',
          '- 흰 배경 · `p-16` · 세로 중앙 정렬',
          '- 좌측: 제목(`gray-800` semibold 16px) + 부제(`gray-500` 12px), `gap-4`',
          '- 우측: `trailing` 슬롯 — 주로 `Toggle`(ON 오렌지 / OFF gray-200)',
        ].join('\n'),
      },
    },
  },
  args: {
    title: '카카오톡 알림 연동',
    description: '카카오 계정으로 리포트 등의 알림을 받습니다.',
  },
} satisfies Meta<typeof SettingRow>

export default meta
type Story = StoryObj<typeof meta>

/** Toggle ON (Figma Default). */
export const On: Story = {
  name: 'Toggle ON',
  args: { trailing: <Toggle defaultChecked aria-label="카카오톡 알림 연동" /> },
}

/** Toggle OFF (Figma Variant2). */
export const Off: Story = {
  name: 'Toggle OFF',
  args: { trailing: <Toggle aria-label="카카오톡 알림 연동" /> },
}

/** 부제 없이 제목만. */
export const TitleOnly: Story = {
  name: '제목만',
  args: { description: undefined, trailing: <Toggle defaultChecked aria-label="알림" /> },
}

/** 토글 인터랙션 — 탭하면 상태 전환. */
export const ToggleInteraction: Story = {
  name: '토글 인터랙션',
  args: { trailing: <Toggle aria-label="카카오톡 알림 연동" /> },
  play: async ({ canvas, userEvent }) => {
    const sw = canvas.getByRole('switch', { name: '카카오톡 알림 연동' })
    await expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    await expect(sw).toHaveAttribute('aria-checked', 'true')
  },
}
