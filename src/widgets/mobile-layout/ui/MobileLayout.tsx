import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { BottomTab } from './BottomTab'
import { useActiveTab } from '../model/useActiveTab'

type MobileLayoutProps = {
  children: ReactNode
  /** 하단 탭 표시 여부 (온보딩·로그인 등 탭이 없는 화면은 false) */
  showBottomTab?: boolean
  /** 본문 자체 스크롤 여부. 지도처럼 내부 제스처가 화면을 소유하면 false */
  scrollable?: boolean
  className?: string
}

/**
 * 모바일 전용 공통 셸(App Shell).
 * - 데스크톱: 회색 배경 위에 폰 폭(max-w-[420px]) 프레임을 가운데 정렬 + 그림자
 * - h-dvh 고정 높이 셸 + overflow-hidden, 본문(main)만 스크롤(overscroll-contain),
 *   하단 탭은 in-flow 로 항상 노출 (position:fixed 안 씀 → 데스크톱 프레임 안에 머무름)
 * - 라우터 도입 시 children → <Outlet /> 으로 바꾸면 그대로 동작
 */
export function MobileLayout({
  children,
  showBottomTab = true,
  scrollable = true,
  className,
}: MobileLayoutProps) {
  const { tab, setTab } = useActiveTab()

  return (
    <div className="flex h-[var(--app-height,100dvh)] justify-center overflow-hidden bg-gray-100">
      {/* pt-safe-top: PWA(standalone)에서 viewport-fit=cover 로 노치 밑까지 확장될 때
          GNB 가 상태바에 깔리지 않게 — 일반 브라우저에선 env()=0 이라 영향 없음.
          높이는 --app-height(useAppHeight 가 window.innerHeight 로 갱신) — iOS PWA 의 dvh 첫 렌더
          어긋남으로 in-flow 하단 탭이 위로 뜨는 문제를 막는다. 변수 없으면 100dvh 폴백. */}
      <div
        className={cn(
          'relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-white pt-safe-top shadow-xl',
          className,
        )}
      >
        {/* 단일 스크롤 영역 — min-h-0 가 있어야 flex 자식이 줄어들어 내부 스크롤이 동작 */}
        {/* TODO(라우터): 뒤로가기 스크롤 복원은 라우터 도입 시 main.scrollTop 수동 저장/복원
            + history.scrollRestoration='manual' 로 처리 (중첩 스크롤러는 브라우저가 복원 안 함) */}
        <main
          className={cn(
            'min-h-0 flex-1',
            scrollable ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden overscroll-none',
          )}
        >
          {children}
        </main>
        {showBottomTab && <BottomTab activeTab={tab} onTabChange={setTab} />}
      </div>
    </div>
  )
}
