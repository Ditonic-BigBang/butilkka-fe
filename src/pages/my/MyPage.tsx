import { Navigate, useNavigate } from 'react-router-dom'
import Building from '~icons/ci/building-01'
import ChevronRight from '~icons/ci/chevron-right'
import { MobileLayout } from '@/widgets/mobile-layout'
import { SettingRow, Tag, Toggle, ToastHost } from '@/shared/ui'
import { ReportProUpgradeCard, ReportProActiveCard } from '@/entities/report'
import { useAuthStore, useIsAuthenticated } from '@/entities/session'
import type { NotificationSettings } from '@/shared/api/types'
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from './model/useNotificationSettings'

// 알림 설정 토글 3종 — 명세(smsAlert·autoReport·urgentAlert) 기준.
// Figma(286:5268)는 "카카오톡 알림 연동" 행이 중복이라, 가운데 행은 autoReport 로 매핑했다.
const SETTING_ROWS: { key: keyof NotificationSettings; title: string; description: string }[] = [
  {
    key: 'smsAlert',
    title: '카카오톡 알림 연동',
    description: '카카오 계정으로 리포트 등의 알림을 받습니다.',
  },
  {
    key: 'autoReport',
    title: '분기별 자동 리포트',
    description: '3개월마다 상권 진단 리포트를 발송합니다.',
  },
  {
    key: 'urgentAlert',
    title: '비상 신호 즉시 알림',
    description: '상권 등급이 급격히 변동하면 즉시 알림을 발송합니다.',
  },
]

/**
 * 마이페이지 (Figma: [4] 마이페이지/[4-1] 기본 286:5268 ·
 * API: GET/PATCH /api/v1/users/me/notification-settings).
 * 내 가게 카드(가게·업종) + 알림 설정 토글 3종 + 기타(로그아웃·탈퇴).
 * 가게·업종 수정 화면은 미구현 — 행은 디자인대로 노출만 한다(TODO).
 */
export default function MyPage() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const settings = useNotificationSettings()
  const updateSettings = useUpdateNotificationSettings()

  // 로그인은 했지만 온보딩을 안 마쳤으면 온보딩부터 (홈과 동일한 가드)
  if (isAuthenticated && user && !user.isOnboarded) return <Navigate to="/onboarding" replace />

  const store = user?.store
  const current = settings.data

  const handleLogout = async () => {
    // 로그아웃 API 가 실패해도 클라 세션은 정리되므로 로그인 화면으로 보낸다.
    await logout().catch(() => undefined)
    navigate('/login', { replace: true })
  }

  return (
    <MobileLayout>
      <div className="min-h-full bg-white">
        <header className="px-5 py-4">
          <h1 className="text-title-s-semibold text-gray-900">마이페이지</h1>
        </header>

        <div className="flex flex-col gap-5 px-5 pb-6">
          <div className="flex flex-col gap-3">
            {/* 가게+업종 통합 카드 (Figma: List_M/가게 427:18737) — 가게명·주소 + 업종 칩 한 행 */}
            {store && (
              <button
                type="button"
                onClick={() => navigate('/my/store')}
                className="flex w-full items-center justify-between gap-3 rounded-12 border border-gray-100 bg-white p-4 text-left"
              >
                <span className="flex min-w-0 items-start gap-2.5">
                  <Building aria-hidden className="size-6 shrink-0 text-gray-900" />
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-body-l-semibold text-gray-900">
                        {store.storeName ?? '내 가게'}
                      </span>
                      <span className="truncate text-caption-l-regular text-gray-500">
                        {store.address ?? store.regionName}
                      </span>
                    </span>
                    {store.categoryName && <Tag className="self-start">{store.categoryName}</Tag>}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-200" />
              </button>
            )}

            {/* 리포트 PRO — 구독 여부로 업그레이드/이용중 카드 (Figma Card_요금제, 가게 카드와 알림 설정 사이).
                미구독이면 업그레이드 → 구독 플랜 확인 화면으로 이동. */}
            {user?.isReportPro ? (
              <ReportProActiveCard />
            ) : (
              <ReportProUpgradeCard onUpgrade={() => navigate('/my/subscription')} />
            )}

            <section className="overflow-hidden rounded-14 border border-gray-100">
              <h2 className="px-5 py-4 text-body-m-semibold text-gray-700">알림 설정</h2>
              {SETTING_ROWS.map((row) => (
                <SettingRow
                  key={row.key}
                  title={row.title}
                  description={row.description}
                  trailing={
                    <Toggle
                      aria-label={row.title}
                      checked={current?.[row.key] ?? false}
                      disabled={!current}
                      onCheckedChange={(checked) => updateSettings.mutate({ [row.key]: checked })}
                    />
                  }
                />
              ))}
            </section>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-body-m-semibold text-gray-500">기타</h2>
            <div className="flex flex-col">
              <LinkRow label="로그아웃" onClick={handleLogout} />
              {/* 탈퇴 API 는 명세에 없어 디자인대로 노출만 — 백엔드 합의 후 연결 */}
              <LinkRow label="탈퇴하기" />
            </div>
          </section>
        </div>

        {/* 업종 변경 등 라우트 토스트 */}
        <ToastHost />
      </div>
    </MobileLayout>
  )
}

/** 기타 섹션 행 — 라벨 + 우측 chevron */
function LinkRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between py-3 text-left"
    >
      <span className="text-body-m-regular text-gray-700">{label}</span>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-gray-200" />
    </button>
  )
}
