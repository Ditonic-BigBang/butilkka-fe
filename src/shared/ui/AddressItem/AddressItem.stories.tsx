import type { Meta, StoryObj } from '@storybook/react-vite'
import { AddressItem } from './AddressItem'

/** 주소 리스트 항목. Figma: Address_List 353:8931. */
const meta = {
  title: 'UI/AddressItem',
  component: AddressItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '주소 리스트 항목 (탭 가능). **Figma:** `353:8931`',
          '',
          '- 흰 배경 · 하단 divider · `px-20 py-16`',
          '- 메인 주소(`gray-900` 14px medium)',
          '- 뱃지(`gray-70` pill, `gray-400`) + 보조 주소(`gray-500`)',
          '- 우측 chevron(`gray-200`). 긴 주소는 말줄임',
        ].join('\n'),
      },
    },
  },
  args: {
    address: '서울 서대문구 명동10길 50',
    badge: '도로명',
    subAddress: '서울 충무로2가 65-4',
  },
} satisfies Meta<typeof AddressItem>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 주소 + 뱃지 + 보조 주소. */
export const Default: Story = {}

/** 주소만 (뱃지·보조 없음). */
export const AddressOnly: Story = {
  name: '주소만',
  args: { badge: undefined, subAddress: undefined },
}

/** 여러 항목 스택 — divider 로 구분되는 리스트. */
export const List: Story = {
  name: '리스트',
  render: (args) => (
    <div className="w-full">
      <AddressItem {...args} />
      <AddressItem address="서울 마포구 와우산로 94" badge="도로명" subAddress="서울 상수동 72-1" />
      <AddressItem address="서울 종로구 종로 1" badge="지번" subAddress="서울 종로1가 1" />
    </div>
  ),
}
