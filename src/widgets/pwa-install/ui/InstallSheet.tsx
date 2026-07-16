import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Logo } from '@/shared/ui/Logo/Logo'
import type { PwaInstallPlatform } from '../model/usePwaInstall'

// iOS 공유 시트 아이콘 (박스 + 위 화살표) — 실제 Safari 공유 버튼과 같은 형태로 인지시킨다.
function IosShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10H6.5A2.5 2.5 0 0 0 4 12.5v6A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 17.5 10H17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// iOS 공유 메뉴의 "홈 화면에 추가" 행 아이콘 (둥근 사각형 + 플러스).
function PlusSquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function Step({ index, children }: { index: number; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-body-m-regular text-gray-600">
      <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200 pb-2 text-caption-l-semibold text-white">
        {index}
      </span>
      <span className="flex-1">{children}</span>
    </p>
  )
}

type InstallSheetProps = {
  platform: Exclude<PwaInstallPlatform, 'unsupported'>
  /** Android: 네이티브 설치 시트 호출. iOS 에선 사용 안 함. */
  onInstall: () => void
  onDismiss: () => void
}

/**
 * "홈 화면에 추가" 유도 시트 (딤 배경 위 하단 시트, 앱 프레임 폭에 맞춤).
 * - android: 오렌지 CTA → Chrome 네이티브 설치 시트
 * - ios: 공유 → 홈 화면에 추가 수동 안내 (애플이 자동 설치를 막음)
 * 표시 여부·플랫폼 판별은 컨테이너(PwaInstallGate)가 usePwaInstall 로 처리한다.
 */
export function InstallSheet({ platform, onInstall, onDismiss }: InstallSheetProps) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onDismiss}
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          entered ? 'opacity-100' : 'opacity-0',
        )}
      />
      {/* 데스크톱에서도 폰 프레임(max-w-430) 하단에 붙도록 폭 제한 + 아래 정렬 */}
      <div className="pointer-events-none relative flex h-full w-full max-w-[430px] flex-col justify-end">
        <dialog
          open
          aria-label="홈 화면에 추가"
          className={cn(
            'pointer-events-auto m-0 flex w-full flex-col items-center gap-6 rounded-t-[20px] border-0 bg-white px-5 pt-8 pb-safe-bottom-or-6 text-inherit shadow-upper transition-transform duration-300 ease-out',
            entered ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex flex-col items-center gap-4">
            {/* 홈 화면에 추가될 앱 아이콘 미리보기 */}
            <div className="flex size-16 items-center justify-center rounded-[14px] bg-key shadow-card">
              <Logo variant="white" className="h-7" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-center text-title-s-semibold text-gray-900">
                홈 화면에 추가하고
                <br />
                앱처럼 열어보세요
              </h2>
              <p className="text-center text-body-m-regular text-gray-500">
                주소창 없이 전체화면으로, 더 빠르게
                <br />내 상권을 확인할 수 있어요
              </p>
            </div>
          </div>

          {platform === 'android' ? (
            <button
              type="button"
              onClick={onInstall}
              className="flex h-13 w-full items-center justify-center rounded-12 bg-key text-body-l-semibold text-white transition active:scale-[0.98] active:bg-orange-600"
            >
              홈 화면에 추가
            </button>
          ) : (
            <div className="flex w-full flex-col gap-3 rounded-12 bg-gray-70 px-4 py-4">
              <Step index={1}>
                Safari 하단 공유 버튼
                <IosShareIcon className="mx-0.5 inline-block size-[18px] align-middle text-info-blue" />
                을 누른 뒤
              </Step>
              <Step index={2}>
                <b className="font-semibold text-gray-900">홈 화면에 추가</b>
                <PlusSquareIcon className="mx-0.5 inline-block size-[18px] align-middle text-gray-900" />
                를 선택하세요
              </Step>
            </div>
          )}

          <button type="button" onClick={onDismiss} className="text-body-m-medium text-gray-400">
            {platform === 'ios' ? '확인했어요' : '나중에 볼게요'}
          </button>
        </dialog>
      </div>
    </div>
  )
}
