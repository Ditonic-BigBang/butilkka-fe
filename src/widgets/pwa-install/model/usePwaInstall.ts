import { useCallback, useState, useSyncExternalStore } from 'react'
import { isIOS, isStandalone } from '@/shared/lib/platform'

// beforeinstallprompt 은 아직 표준 DOM 타입에 없어 최소 형태로 선언한다.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type PwaInstallPlatform = 'ios' | 'android' | 'unsupported'
export type PwaInstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

const DISMISS_KEY = 'pwa-install-dismissed'

// beforeinstallprompt 는 로드 직후 딱 한 번, React 리스너가 붙기 전에 올 수 있다
// → 모듈 로드(가장 이른 시점)에 캡처해 모듈 스코프에 보관하고, 구독자에게 알린다.
let deferredPrompt: BeforeInstallPromptEvent | null = null
const subscribers = new Set<() => void>()
const emit = () => {
  for (const notify of subscribers) notify()
}

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}
function persistDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // 시크릿 모드 등 localStorage 접근 불가 — 이 세션 state 로만 처리한다.
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // 브라우저 기본 미니 배너를 억제하고, 우리 UI 로 설치를 유도한다.
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    persistDismissed()
    emit()
  })
}

function subscribe(notify: () => void) {
  subscribers.add(notify)
  return () => {
    subscribers.delete(notify)
  }
}

/**
 * PWA "홈 화면에 추가" 상태·액션.
 * - Android/데스크톱 Chrome: `beforeinstallprompt` 를 캡처해 네이티브 설치 시트를 우리 버튼으로 유도
 * - iOS: 네이티브 설치 이벤트가 없어 안내만 (공유 → 홈 화면에 추가)
 * - 이미 standalone(홈 아이콘 실행)·설치 완료·사용자가 닫음 → `canShow=false`
 *
 * 주의: dev(`pnpm dev`)는 서비스워커 미등록이라 `beforeinstallprompt` 가 안 뜬다
 * → Android 플로우는 배포본(butilkka.site)에서 확인. 시각 확인은 Storybook.
 */
export function usePwaInstall() {
  const prompt = useSyncExternalStore(
    subscribe,
    () => deferredPrompt,
    () => null,
  )
  const [dismissed, setDismissed] = useState(readDismissed)

  const platform: PwaInstallPlatform = isIOS() ? 'ios' : prompt ? 'android' : 'unsupported'
  const canShow = !isStandalone() && !dismissed && platform !== 'unsupported'

  const promptInstall = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (!deferredPrompt) return 'unavailable'
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    // prompt() 는 1회용 — 소모 후 폐기한다 (같은 이벤트로 재호출 불가).
    deferredPrompt = null
    emit()
    if (outcome === 'accepted') {
      persistDismissed()
      setDismissed(true)
    }
    return outcome
  }, [])

  const dismiss = useCallback(() => {
    persistDismissed()
    setDismissed(true)
  }, [])

  return { canShow, platform, promptInstall, dismiss }
}
