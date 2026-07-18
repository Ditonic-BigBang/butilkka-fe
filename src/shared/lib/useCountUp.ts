import { useEffect, useRef, useState } from 'react'

// ease-out cubic — 빠르게 치고 올라가 부드럽게 안착
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * 숫자 카운트업 — 마운트 시 0에서 목표값까지 rAF 로 차오른다 (ease-out).
 * 목표값이 바뀌면 현재 표시값에서 새 목표로 이어서 진행.
 * prefers-reduced-motion 이면 애니 없이 즉시 목표값.
 * 포맷(소수점·천단위·단위 문자)은 호출부가 반환값으로 처리한다.
 */
export function useCountUp(target: number, duration = 700): number {
  const reduced = prefersReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)
  // 다음 애니메이션의 시작값 — target 변경 시 점프 없이 현재 값에서 이어가기 위함
  const fromRef = useRef(reduced ? target : 0)

  useEffect(() => {
    if (reduced || fromRef.current === target) {
      fromRef.current = target
      setValue(target)
      return
    }

    const from = fromRef.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const next = from + (target - from) * easeOut(t)
      fromRef.current = next
      setValue(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])

  return value
}
