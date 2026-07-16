import { useEffect, useState } from 'react'
import { useAuthStore } from '@/entities/session'
import { usePwaInstall } from '../model/usePwaInstall'
import { InstallSheet } from './InstallSheet'

// 로그인/첫 화면이 먼저 그려진 뒤 살짝 늦게 올라오게 — "거의 즉시"지만 세션 확인 스플래시 위엔 안 겹치게.
const APPEAR_DELAY_MS = 500

/**
 * "홈 화면에 추가" 유도 게이트 — 앱 최상단에 마운트(App).
 * 설치 가능 상황에서만 하단 시트를 띄우고, 그 외(이미 설치·standalone·닫음·미지원)엔
 * 아무것도 렌더하지 않는다. 발표 데모에서 QR/URL 진입 사용자에게 설치를 유도하는 용도.
 *
 * 노출 시점: 세션 확인이 끝나(첫 화면=로그인 렌더) + 짧은 딜레이 후. → 스플래시 위에 겹치지 않는다.
 */
export function PwaInstallGate() {
  const { canShow, platform, promptInstall, dismiss } = usePwaInstall()
  const status = useAuthStore((s) => s.status)
  const sessionResolved = status !== 'idle' && status !== 'checking'

  const [delayPassed, setDelayPassed] = useState(false)
  useEffect(() => {
    if (!sessionResolved) return
    const id = window.setTimeout(() => setDelayPassed(true), APPEAR_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [sessionResolved])

  if (!sessionResolved || !delayPassed || !canShow || platform === 'unsupported') return null

  return (
    <InstallSheet platform={platform} onInstall={() => void promptInstall()} onDismiss={dismiss} />
  )
}
