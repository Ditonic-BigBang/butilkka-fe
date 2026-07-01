import { cn } from '@/shared/lib/cn'

type LocationMarkerProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** 지역명 (예: 서대문구) */
  title: React.ReactNode
  /** 보조 값 (예: 인구수) */
  caption?: React.ReactNode
}

/**
 * 지도 위치 마커 (Figma: Location container 336:7579).
 * gray-900 원형 + 흰 텍스트(지역명 + 보조값). 지도 위에 올려 지역/지표를 표시.
 */
export function LocationMarker({ title, caption, className, ...props }: LocationMarkerProps) {
  return (
    <div
      className={cn(
        'flex size-[94px] flex-col items-center justify-center rounded-max bg-gray-900 text-center text-white shadow-[0_0_16px_0_rgba(0,0,0,0.06)]',
        className,
      )}
      {...props}
    >
      <span className="text-body-m-semibold">{title}</span>
      {caption && <span className="text-body-m-medium">{caption}</span>}
    </div>
  )
}
