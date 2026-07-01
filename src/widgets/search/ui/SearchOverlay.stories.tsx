import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Toast } from '@/shared/ui'
import { SearchOverlay } from './SearchOverlay'
import { MAP_FILTERS } from '../model/filters'

/** 지도 상단 검색 오버레이. Figma: Search 257:7191. */
const meta = {
  title: 'Widgets/SearchOverlay',
  component: SearchOverlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '지도 위 상단 검색 오버레이. **Figma:** `257:7191`',
          '',
          '**두 맥락**을 하나의 위젯이 포커스로 전환:',
          '- **지도 화면(미포커스)** → 검색바 + **가로 스크롤 필터칩**(기간·쇠퇴등급…). 밑에 지도.',
          '- **검색 포커스** → 즐겨찾기 등록/목록·검색 결과. (아래 스토리 분리)',
          '',
          '위젯은 표현 전용(콜백 emit). 상태 전환(registerMode·savedPlaces)은 상위가 배선.',
        ].join('\n'),
      },
    },
  },
  args: { query: '', onQueryChange: () => {}, filters: MAP_FILTERS },
} satisfies Meta<typeof SearchOverlay>

export default meta
type Story = StoryObj<typeof meta>

const SEOUL_DISTRICTS = [
  '서울 서대문구',
  '서울 마포구',
  '서울 종로구',
  '서울 중구',
  '서울 광진구',
  '서울 노원구',
]

const NO_PLACES: string[] = []

function SearchFlow({
  initialPlaces = NO_PLACES,
  background = 'bg-gray-90',
}: {
  initialPlaces?: string[]
  background?: string
}) {
  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>('grade')
  const [savedPlaces, setSavedPlaces] = useState<string[]>(initialPlaces)
  const [registerMode, setRegisterMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return SEOUL_DISTRICTS.filter((d) => d.includes(q)).map((label, i) => ({
      id: String(i),
      label,
    }))
  }, [query])

  const flashToast = (msg: string) => {
    setToast(msg)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2500)
  }

  const registerPlace = (name: string) => {
    setSavedPlaces((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setRegisterMode(false)
    setQuery('')
    flashToast('즐겨찾는 지역에 등록되었습니다.')
  }

  const handleResultSelect = (id: string) => {
    const label = results.find((r) => r.id === id)?.label ?? ''
    const name = label.replace(/^서울\s*/, '')
    if (registerMode) registerPlace(name)
    else setQuery(label)
  }

  return (
    <div className={`relative h-dvh ${background}`}>
      <SearchOverlay
        query={query}
        onQueryChange={setQuery}
        filters={MAP_FILTERS}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
        results={results}
        onResultSelect={handleResultSelect}
        savedPlaces={savedPlaces}
        onAddPlace={() => setRegisterMode(true)}
        onEditPlaces={() => {}}
        registerMode={registerMode}
        onSelectFromMap={() => registerPlace('서대문구')}
      />
      {toast && (
        <div className="absolute inset-x-5 bottom-6">
          <Toast>{toast}</Toast>
        </div>
      )}
    </div>
  )
}

/**
 * 지도 화면 (미포커스) — 검색바 + 가로 스크롤 필터칩. 밑에 지도가 있는 기본 상태.
 * 칩을 좌우로 스크롤하면 공실률·폐업률까지 보인다. (검색창을 누르면 검색 포커스로 전환)
 */
export const MapFilter: Story = {
  name: '지도 화면 (필터)',
  render: () => <SearchFlow initialPlaces={['서대문구', '종로구', '중구']} />,
}

/**
 * 검색 플로우 (포커스) — 검색창 포커스 → (즐겨찾기 없음) ⊕ 즐겨찾는 지역 등록 →
 * register 모드(지도에서 선택 / 검색) → 선택 → Toast + Myplaces 추가.
 */
export const SearchFocusFlow: Story = {
  name: '검색 플로우 (등록)',
  render: () => <SearchFlow />,
  play: async ({ canvas, userEvent, step }) => {
    await step('포커스 → 즐겨찾는 지역 등록 안내', async () => {
      await userEvent.click(canvas.getByRole('searchbox'))
      await expect(canvas.getByRole('button', { name: /즐겨찾는 지역 등록/ })).toBeInTheDocument()
    })

    await step('등록 탭 → 지도에서 선택(register 모드)', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /즐겨찾는 지역 등록/ }))
      await expect(canvas.getByRole('button', { name: /지도에서 선택/ })).toBeInTheDocument()
    })

    await step('지도에서 선택 → Toast + Myplaces 등록', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /지도에서 선택/ }))
      await expect(await canvas.findByText('즐겨찾는 지역에 등록되었습니다.')).toBeInTheDocument()
      await expect(canvas.getByText('서대문구')).toBeInTheDocument()
    })
  },
}
