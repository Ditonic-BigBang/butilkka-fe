import { cn } from '@/shared/lib/cn'
import ticket from '../assets/pro-ticket.svg'

// 구독 혜택 카피 (Figma 1835:16932) — 지도 잠금까지 덮게 되면서 상권지도 항목이 맨 앞에 붙었다
const SUBSCRIPTION_BENEFITS = [
  '서울시 상권지도와 세부 지표 기능 제공',
  '이해도 상승을 위한 유사 사례 제공',
  '심화 분석 기능 제공',
  '최대 3년 종합 리포트 제공',
  '상세 리포트 PDF 다운로드 기능 제공',
]

type ReportPaywallCardProps = {
  /** "확인하러 가기" — 구독 요금제 화면 이동은 페이지가 처리 */
  onConfirm?: () => void
  className?: string
}

/**
 * 데이터 구독 결제 유도 카드 (Figma: Card_요금제 현질유도 1835:16932).
 * 구독 전 잠긴 화면 위에 띄운다 — 🎫 티켓 + 타이틀 + 안내문 +
 * [확인하러 가기] + 구분선 + 구독 혜택 목록. 흰 카드, key 색 테두리, rounded-16.
 * 리포트·지도가 같은 카드를 같은 내용으로 쓴다.
 */
export function ReportPaywallCard({ onConfirm, className }: ReportPaywallCardProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-7 rounded-16 border border-key bg-white px-5 py-[30px] text-center',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-2">
          <img src={ticket} alt="" className="size-[42px]" />
          <p className="text-title-m-bold whitespace-pre-line text-gray-900">
            {'내 가게에 맞는 대응 전략을\n확인해보세요'}
          </p>
        </div>
        <p className="text-body-l-medium whitespace-pre-line text-gray-600">
          {'데이터를 구독하고 상권 쇠퇴 예측과\n자세한 분석을 확인해보세요.'}
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="rounded-max bg-key px-[18px] py-2.5 text-body-l-semibold text-white transition duration-150 active:scale-[0.97] active:bg-orange-600"
      >
        확인하러 가기
      </button>

      <div className="h-px w-full bg-gray-90" />

      <div className="flex w-full flex-col gap-2.5">
        <p className="text-body-l-semibold text-gray-700">데이터 구독</p>
        <ul className="flex flex-col gap-1.5 text-body-m-medium text-gray-600">
          {SUBSCRIPTION_BENEFITS.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
