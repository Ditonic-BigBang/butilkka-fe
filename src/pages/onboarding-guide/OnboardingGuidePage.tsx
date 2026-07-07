import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { MobileLayout, GNB } from '@/widgets/mobile-layout'
import { CTA } from '@/shared/ui'
import { useAuthStore } from '@/entities/session'
import { cn } from '@/shared/lib/cn'
import analyzeImage from './assets/guide-analyze.svg'
import warningImage from './assets/guide-warning.svg'
import decisionImage from './assets/guide-decision.svg'

// 일러스트 크기는 Figma 원본 px 고정 (viewBox 비율 유지)
const SLIDES = [
  {
    image: analyzeImage,
    imageClassName: 'w-[248px]',
    title: '우리 가게의 상권을 분석해요',
    description:
      '유동인구, 공실률, 폐업률 등\n다양한 데이터를 종합해\n현재 상권 등급을 확인할 수 있어요.',
  },
  {
    image: warningImage,
    imageClassName: 'w-[259px]',
    title: '위험 신호를 먼저 알려드려요',
    description:
      '상권이 실제로 쇠퇴하기 전에 나타나는\n선행 신호를 분석해 위험 변화를 미리 알려드려요.',
  },
  {
    image: decisionImage,
    imageClassName: 'w-[286px]',
    title: '더 나은 의사결정을 도와드려요',
    description: '내 상권과 비슷한 과거 사례를 분석해\n버틸지, 옮길지 객관적인 판단을 도와드려요.',
  },
] as const

const LAST = SLIDES.length - 1
// 스와이프 확정 임계값 — 뷰포트 폭 대비 비율 (이만큼 끌어야 다음 장으로 넘어감)
const SWIPE_RATIO = 0.2
// 양 끝에서 더 끌 때 저항 (고무줄 느낌 — 빈 공간 노출 방지)
const EDGE_RESISTANCE = 0.3

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * 가입 완료 직후 서비스 소개 가이드 3장 (Figma: 온보딩_1~3 558:11479 · 558:11536 · 558:11570).
 * 좌우 스와이프(포인터 드래그)로 슬라이드 전환 — 손가락을 따라 트랙이 움직이고 놓으면 스냅.
 * '다음'으로도 넘기고, 마지막 '시작하기'에서 홈으로. 뒤로가기 없는 플로우(스와이프 백은 허용).
 */
export default function OnboardingGuidePage() {
  const navigate = useNavigate()
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const reduceMotion = usePrefersReducedMotion()

  const [index, setIndex] = useState(0)
  const [dragDx, setDragDx] = useState(0) // 드래그 중 실시간 offset(px)
  const [dragging, setDragging] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)

  if (status !== 'authenticated') return <Navigate to="/login" replace />

  const isLast = index === LAST

  // 온보딩(폼+가이드) 최종 완료 — 여기서 isOnboarded 를 플립한다.
  // 저장 시점이 아닌 이 시점에 플립해야 OnboardingPage 의 'onboarded → 홈' 가드와
  // 경합하지 않는다(= confetti '다음'에서 가이드를 건너뛰고 홈으로 튀는 문제 방지).
  const finishGuide = () => {
    if (user && !user.isOnboarded) setUser({ ...user, isOnboarded: true })
    navigate('/', { replace: true })
  }

  const next = () => {
    if (isLast) finishGuide()
    else setIndex((i) => Math.min(i + 1, LAST))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const dx = e.clientX - startXRef.current
    // 첫 장에서 오른쪽(이전 없음), 마지막 장에서 왼쪽(다음 없음)은 저항 적용
    const atEdge = (index === 0 && dx > 0) || (index === LAST && dx < 0)
    setDragDx(atEdge ? dx * EDGE_RESISTANCE : dx)
  }

  const endDrag = () => {
    if (!dragging) return
    const width = viewportRef.current?.clientWidth ?? 1
    const threshold = width * SWIPE_RATIO
    if (dragDx <= -threshold) setIndex((i) => Math.min(i + 1, LAST))
    else if (dragDx >= threshold) setIndex((i) => Math.max(i - 1, 0))
    setDragging(false)
    setDragDx(0)
  }

  return (
    <MobileLayout showBottomTab={false}>
      <div className="flex min-h-full flex-col bg-white">
        {/* Figma 상단은 빈 GNB (뒤로가기·설정 없음) — 높이 확보용 */}
        <GNB showBack={false} showSettings={false} />

        {/* 스와이프 뷰포트 — 3장 트랙을 가로로 담고 넘치는 부분은 클립.
            touch-action: pan-y → 세로 스크롤은 브라우저, 가로 제스처는 여기서 처리 */}
        <div
          ref={viewportRef}
          className="relative flex-1 overflow-hidden select-none"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className={cn(
              // absolute inset-0 로 트랙 높이를 뷰포트에 확실히 고정 → 슬라이드의 flex-1 이 동작
              'absolute inset-0 flex',
              !dragging && !reduceMotion && 'transition-transform duration-300 ease-out',
            )}
            style={{ transform: `translateX(calc(${-index * 100}% + ${dragDx}px))` }}
          >
            {SLIDES.map((s) => (
              <div key={s.title} className="flex h-full w-full shrink-0 flex-col">
                {/* 일러스트 — Figma 는 슬라이드마다 이미지 중심을 같은 높이(프레임 y≈324)에 둠.
                    pt 로 중심을 아래로 내려 고정 (items-center 라 이미지 높이가 달라도 중심 일정) */}
                <div className="flex flex-1 items-center justify-center px-5 pt-[72px]">
                  {/* draggable=false: 이미지 기본 드래그가 포인터 캡처를 가로채지 않게 */}
                  <img
                    src={s.image}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className={s.imageClassName}
                  />
                </div>

                {/* 타이틀 블록 — min-h 는 3줄 설명(1번 슬라이드) 기준으로 높이 통일 */}
                <div className="flex min-h-[114px] flex-col gap-3.5 px-5 text-center">
                  <h1 className="text-title-m-semibold text-gray-900">{s.title}</h1>
                  <p className="text-body-l-medium whitespace-pre-line text-gray-400">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 도트 인디케이터 — Figma: 타이틀 블록에서 115px 아래, CTA 위 */}
        <div className="mt-[115px] flex shrink justify-center gap-2 pb-[15px]" aria-hidden>
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                'size-2.5 rounded-full transition-colors',
                i === index ? 'bg-key' : 'bg-gray-100',
              )}
            />
          ))}
        </div>

        <CTA onClick={next}>{isLast ? '시작하기' : '다음'}</CTA>
      </div>
    </MobileLayout>
  )
}
