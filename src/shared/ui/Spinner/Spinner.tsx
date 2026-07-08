import { cn } from '@/shared/lib/cn'

type SpinnerProps = {
  className?: string
  'aria-label'?: string
}

/**
 * 로딩 스피너 (Figma: Loading 477:13033).
 * 다크 트랙 도넛(gray-900) 위에 오렌지 호(key, 1/4)가 중심을 축으로 회전한다.
 * 크기는 `className`(예: `size-8`)로 조절 — 내부 요소가 비율로 따라간다.
 * `<output>`(암묵 role="status") 으로 스크린리더에 로딩 상태를 알린다(기본 라벨 "로딩 중").
 */
export function Spinner({ className, 'aria-label': ariaLabel = '로딩 중' }: SpinnerProps) {
  return (
    <output aria-label={ariaLabel} className={cn('relative block size-[46px]', className)}>
      {/* 트랙 도넛 */}
      <svg viewBox="0 0 46 46" fill="none" aria-hidden className="absolute inset-0 size-full">
        <path
          d="M46 23C46 35.7025 35.7025 46 23 46C10.2975 46 0 35.7025 0 23C0 10.2975 10.2975 0 23 0C35.7025 0 46 10.2975 46 23ZM13.8 23C13.8 28.081 17.919 32.2 23 32.2C28.081 32.2 32.2 28.081 32.2 23C32.2 17.919 28.081 13.8 23 13.8C17.919 13.8 13.8 17.919 13.8 23Z"
          fill="var(--color-gray-900)"
        />
      </svg>
      {/* 오렌지 호 — 우상단 1/4에 두고, 좌하단(=중심) 기준으로 회전 */}
      <div className="absolute top-0 right-0 size-1/2 origin-bottom-left animate-spin motion-reduce:animate-none">
        <svg viewBox="0 0 23 23" fill="none" aria-hidden className="size-full">
          <path
            d="M2.74272e-07 0C6.09998 7.27415e-08 11.9501 2.42321 16.2635 6.73654C20.5768 11.0499 23 16.9 23 23L9.2 23C9.2 20.56 8.23072 18.22 6.50538 16.4946C4.78005 14.7693 2.43999 13.8 1.09709e-07 13.8L2.74272e-07 0Z"
            fill="var(--color-key)"
          />
        </svg>
      </div>
    </output>
  )
}
