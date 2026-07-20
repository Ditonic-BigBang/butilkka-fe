import { useNavigate } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { Bone, EmptyState, ErrorRetry, NotificationItem } from '@/shared/ui'
import { useNotifications, useMarkNotificationRead } from './model/useNotifications'

/**
 * 알림 내역 (Figma: [1-2] 알림 내역 247:1619 · API: GET /api/v1/notifications).
 * 홈 헤더 벨 → 진입하는 상세 화면(하단 탭 없음).
 * GNB(뒤로·설정) + 알림 리스트(공통 NotificationItem). 안 읽음은 soft-blue 강조,
 * 항목 탭 시 PATCH 로 읽음 처리한다.
 */
export default function NotificationsPage() {
  const navigate = useNavigate()
  const notifications = useNotifications()
  const markRead = useMarkNotificationRead()

  const handleOpen = (id: number, read: boolean) => {
    if (!read) markRead.mutate(id)
    // TODO: onClick — 알림 → 리포트 상세 라우팅 (리포트 페이지 구현 후)
  }

  let content
  if (notifications.isPending) {
    content = <NotificationSkeleton />
  } else if (notifications.isError) {
    content = (
      <ErrorRetry
        message="알림을 불러오지 못했어요"
        onRetry={() => notifications.refetch()}
        className="flex-1 justify-center"
      />
    )
  } else if (notifications.data.length === 0) {
    content = <EmptyState message="도착한 알림이 없어요" className="flex-1" />
  } else {
    content = (
      <ul className="flex flex-col pt-3">
        {notifications.data.map((n) => (
          <li key={n.id}>
            <NotificationItem
              category={n.category}
              date={n.date}
              title={n.title}
              action={n.action}
              read={n.read}
              onClick={() => handleOpen(n.id, n.read)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        {/* 설정 기어는 디자인대로 노출만 — 이동 동작 없음(의도) */}
        <GNB title="알림" onBack={() => navigate(-1)} />
        {content}
      </div>
    </MobileLayout>
  )
}

/** 로딩 스켈레톤 — 알림 행 형태 3줄 */
export function NotificationSkeleton() {
  return (
    <ul className="flex flex-col gap-4 px-5 pt-7">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex gap-3.5">
          <Bone className="size-7 shrink-0 rounded-8" />
          <div className="flex flex-1 flex-col gap-2.5 pt-1">
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-3/4" />
            <Bone className="h-3.5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}
