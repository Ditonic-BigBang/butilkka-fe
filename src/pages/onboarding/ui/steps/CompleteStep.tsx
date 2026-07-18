import { useEffect, useRef } from 'react'
import confettiImage from '../../assets/confetti.svg'
import { useOnboardingStore } from '../../model/useOnboardingStore'
import { OnboardingStepLayout } from '../OnboardingStepLayout'

// 일러스트(confetti.svg)에 쓰인 팔레트 그대로 — 오렌지·하늘색·노랑
const CONFETTI_COLORS = ['#ff8800', '#ffb159', '#6bd0ff', '#9adfff', '#ffe68c']

// @types/canvas-confetti 는 `export =` 모듈이라 typeof import 가 곧 함수 타입이다
type ConfettiFn = typeof import('canvas-confetti')

/**
 * 진입 시 폭죽 발사 — 일러스트 콘의 입구(이미지 기준 54%, 50%)에서
 * 콘이 향한 왼쪽 위(angle 130°)로 터져 정적 이미지와 이어져 보이게.
 */
function fireConfetti(confetti: ConfettiFn, img: HTMLImageElement | null) {
  const rect = img?.getBoundingClientRect()
  const origin = rect
    ? {
        x: (rect.left + rect.width * 0.54) / window.innerWidth,
        y: (rect.top + rect.height * 0.5) / window.innerHeight,
      }
    : { x: 0.5, y: 0.45 }

  // 큰 한 방 + 잠깐 뒤 잔폭죽 — scalar 로 조각 크기 조절
  void confetti({
    particleCount: 90,
    angle: 130,
    spread: 60,
    startVelocity: 55,
    ticks: 220,
    scalar: 1.5,
    origin,
    colors: CONFETTI_COLORS,
  })
  return setTimeout(() => {
    void confetti({
      particleCount: 40,
      angle: 130,
      spread: 80,
      startVelocity: 35,
      scalar: 1.1,
      origin,
      colors: CONFETTI_COLORS,
    })
  }, 180)
}

type CompleteStepProps = {
  /** '다음' — 가게 정보 저장(PUT) 후 온보딩 종료 (이동은 페이지가 처리) */
  onFinish: () => void
  /** 저장 요청 진행 중 — CTA 잠금 */
  pending?: boolean
  /** 저장 실패 메시지 (서버 message) */
  errorMessage?: string
}

/**
 * 회원가입 완료 스텝 (Figma: 558:11670).
 * 폭죽 그래픽(+canvas-confetti 애니메이션) + '다음' CTA — 저장 성공 후 가이드 온보딩으로 이어진다.
 */
export function CompleteStep({ onFinish, pending = false, errorMessage }: CompleteStepProps) {
  const back = useOnboardingStore((s) => s.back)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // 모션 최소화 설정 사용자는 폭죽 생략 — 라이브러리 로드도 하지 않는다
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // 라이브러리는 발사 시점에만 동적 로드 — 페이지 초기 청크에서 제외
    // StrictMode(dev)에선 마운트가 2회라 두 번 터질 수 있음 — 무해, prod 는 1회
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    void import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return
      timer = fireConfetti(confetti, imgRef.current)
    })
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return (
    <OnboardingStepLayout
      title={'회원가입이\n완료되었어요!'}
      onBack={back}
      cta={pending ? '저장 중…' : '다음'}
      ctaDisabled={pending}
      onCta={onFinish}
      // Figma: 폭죽 top = 타이틀 블록 끝 + 131px (y=343, 상태바 54 제외 → 289)
      contentClassName="flex flex-col items-center gap-6 px-5 pt-[131px]"
    >
      <img ref={imgRef} src={confettiImage} alt="" aria-hidden className="w-[251px]" />
      {errorMessage && (
        <p className="text-center text-body-m-regular text-status-red">{errorMessage}</p>
      )}
    </OnboardingStepLayout>
  )
}
