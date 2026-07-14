import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfirmPopup } from './ConfirmPopup'

/** 중앙 확인 팝업. Figma: Popup `424:12189`. */
const meta = {
  title: 'UI/ConfirmPopup',
  component: ConfirmPopup,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '중앙 확인 팝업. **Figma:** `424:12189`',
          '',
          '- 딤(50%) 위 흰 카드 — 본문 + 우하단 취소/확인 텍스트 버튼',
          '- 앱 프레임 안 absolute — 부모에 relative 컨테이너 필요',
        ].join('\n'),
      },
    },
  },
  args: {
    open: true,
    onCancel: () => {},
    onConfirm: () => {},
    children: '내용',
  },
} satisfies Meta<typeof ConfirmPopup>

export default meta
type Story = StoryObj<typeof meta>

/** 즐겨찾는 지역 삭제 확인 (지도 검색 플로우). */
export const Default: Story = {
  name: '기본',
  render: () => <Demo />,
}

function Demo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="relative h-[400px] w-full bg-gray-70">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="m-5 rounded-8 bg-white px-4 py-2 text-body-m-medium"
      >
        팝업 열기
      </button>
      <ConfirmPopup open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)}>
        <span className="font-semibold text-gray-900">서울 종로구</span>를 삭제하시겠습니까?
      </ConfirmPopup>
    </div>
  )
}
