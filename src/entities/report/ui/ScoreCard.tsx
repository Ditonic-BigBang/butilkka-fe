import { cn } from '@/shared/lib/cn'

type ScoreCardProps = {
  /** 좌상단 제목 (기본: "상권 점수") */
  title?: string
  /** 기간 (예: "2026년 2분기") */
  period: string
  /** 상권 유형 칩 (예: "쇠퇴형") */
  type: string
  /** 등급 (예: "C등급") */
  grade: string
  /** 상태 칩 (예: "주의") */
  status: string
  /** 게이지 우측 라벨 (예: "쇠퇴 위험도") */
  gaugeLabel: string
  /** 게이지 채움 비율 0~1 */
  progress: number
  /** 게이지 마커 개수 (기본 4) */
  segments?: number
  /** 설명 (여러 줄은 \n) */
  description: string
  className?: string
}

// 채움 끝이 마커 점 근처(±4%p)에 오면 점을 살짝 감싸는 위치(+1.5%p)로 스냅 —
// 점수 그대로 그리면 점을 반쯤 자르거나(38% vs 37.5% 점) 짧은 꼬리가 남아(16% vs 12.5% 점)
// Figma(372:14335)의 "흰 점이 채움의 둥근 끝에 안착" 모양이 깨진다.
const SNAP_RANGE = 0.04
const SNAP_OFFSET = 0.015

function snapToMarker(progress: number, segments: number): number {
  for (let i = 0; i < segments; i++) {
    const pos = (i + 0.5) / segments
    if (Math.abs(progress - pos) <= SNAP_RANGE) return pos + SNAP_OFFSET
  }
  return progress
}

/**
 * 상권 점수 카드 (Figma: Card_M_상권점수 372:14335).
 * [제목·기간 + 유형칩] / [등급·상태칩 + 위험도 게이지] / 설명. rounded-14 흰 카드.
 * 게이지: 트랙(gray-90) + 오렌지 fill(progress) + 마커 점(fill 안=흰 / 밖=gray-200).
 */
export function ScoreCard({
  title = '상권 점수',
  period,
  type,
  grade,
  status,
  gaugeLabel,
  progress,
  segments = 4,
  description,
  className,
}: ScoreCardProps) {
  const clamped = Math.min(Math.max(progress, 0), 1)
  // 마커 점과의 충돌 보정 — 점 색상 판정도 같은 값을 써야 채움 안 점이 회색으로 남지 않는다
  const fill = snapToMarker(clamped, segments)

  return (
    <div className={cn('flex w-full flex-col gap-3 rounded-14 bg-white px-4 py-5', className)}>
      <div className="flex flex-col gap-4">
        {/* 제목·기간 + 유형칩 */}
        <div className="flex items-start justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-body-m-semibold text-gray-600">{title}</span>
            <span className="truncate text-body-m-regular text-gray-300">{period}</span>
          </span>
          <span className="shrink-0 rounded-6 bg-gray-70 px-3 py-1 text-body-m-regular text-gray-600">
            {type}
          </span>
        </div>

        {/* 등급·상태칩 + 위험도 라벨 + 게이지 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="text-title-m-bold text-gray-900">{grade}</span>
              {/* 게이지가 어느 정도 차오른 시점(0.5s)에 팝 인 */}
              <span className="shrink-0 animate-pop-in rounded-max bg-orange-10 px-3 py-1 text-body-m-medium text-orange-400 [animation-delay:500ms]">
                {status}
              </span>
            </span>
            <span className="shrink-0 text-caption-l-regular text-gray-600">{gaugeLabel}</span>
          </div>

          {/* 게이지 바 */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-90">
            {/* 채움 — 진입 시 0에서 점수까지 차오름 */}
            <div
              className="absolute inset-y-0 left-0 animate-gauge-fill rounded-full bg-orange-500"
              style={{ width: `${fill * 100}%` }}
            />
            {Array.from({ length: segments }, (_, i) => {
              const pos = (i + 0.5) / segments
              const inside = pos <= fill
              return (
                // 바깥 span 이 위치(translate) 담당 — pop-in 의 transform 과 분리
                <span
                  key={pos}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos * 100}%` }}
                >
                  <span
                    className={cn(
                      'block size-1.5 rounded-full',
                      // 채움 안 점은 게이지 끝이 지나가는 타이밍에 맞춰 순서대로 팝 인
                      inside ? 'animate-pop-in bg-white' : 'bg-gray-200',
                    )}
                    style={
                      inside ? { animationDelay: `${Math.round(150 + 800 * pos)}ms` } : undefined
                    }
                  />
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-body-m-medium whitespace-pre-line text-gray-500">{description}</p>
    </div>
  )
}
