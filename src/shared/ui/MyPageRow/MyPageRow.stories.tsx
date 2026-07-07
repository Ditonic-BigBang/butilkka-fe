import type { Meta, StoryObj } from '@storybook/react-vite'
import TagIcon from '~icons/ci/tag'
import Building from '~icons/ci/building-01'
import { Tag } from '../Tag/Tag'
import { MyPageRow } from './MyPageRow'

/** 마이페이지 리스트 행. Figma: List_M 427:18736. */
const meta = {
  title: 'UI/MyPageRow',
  component: MyPageRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '마이페이지 리스트 행. **Figma:** `427:18736` (Default / Variant2)',
          '',
          '- 흰 배경 · `px-16 py-20` · 우측 chevron(gray-200)',
          '- 좌측 `icon` + `label`(semibold) + `children`(칩·2줄 등 자유 슬롯)',
          '- 예) 업종(태그 + 오렌지 칩) · 가게(빌딩 + 이름·주소 2줄)',
        ].join('\n'),
      },
    },
  },
  args: { onClick: () => {} },
} satisfies Meta<typeof MyPageRow>

export default meta
type Story = StoryObj<typeof meta>

/** 업종 — 태그 아이콘 + 라벨 + 오렌지 칩. (Figma Default) */
export const Category: Story = {
  name: '업종 (칩)',
  args: {
    icon: <TagIcon className="size-6 text-gray-900" />,
    label: '업종',
    children: <Tag>커피·음료</Tag>,
  },
}

/** 가게 — 빌딩 아이콘 + 이름·주소 2줄. (Figma Variant2) */
export const Store: Story = {
  name: '가게 (2줄)',
  args: {
    icon: <Building className="size-6 text-gray-900" />,
    children: (
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-body-l-semibold text-gray-900">
          뽀짜이 베트남쌀국수 명동본점
        </span>
        <span className="truncate text-caption-l-regular text-gray-500">
          서울 중구 명동10길 52 신한익스페이스
        </span>
      </span>
    ),
  },
}

/** 리스트 — 업종 + 가게 스택. */
export const List: Story = {
  name: '리스트',
  render: (args) => (
    <div className="w-full">
      <MyPageRow {...args} icon={<TagIcon className="size-6 text-gray-900" />} label="업종">
        <Tag>커피·음료</Tag>
      </MyPageRow>
      <MyPageRow {...args} icon={<Building className="size-6 text-gray-900" />}>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body-l-semibold text-gray-900">
            뽀짜이 베트남쌀국수 명동본점
          </span>
          <span className="truncate text-caption-l-regular text-gray-500">
            서울 중구 명동10길 52 신한익스페이스
          </span>
        </span>
      </MyPageRow>
    </div>
  ),
}
