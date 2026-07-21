import { cn } from '@/shared/lib/cn'
import ticket from '../assets/pro-ticket.svg'

// PRO 혜택 카피 — 구독 요금제 화면과 동일한 4가지
const PRO_BENEFITS = [
  '이해도 상승을 위한 유사 사례 제공',
  '심화 분석 기능 제공',
  '최대 3년 종합 리포트 제공',
  '상세 리포트 PDF 다운로드 기능 제공',
]

type ReportPaywallCardProps = {
  /** 타이틀 (\n 줄바꿈 반영). 기본은 리포트용 카피 */
  title?: string
  /** 타이틀 아래 안내문 (\n 줄바꿈 반영). 기본은 리포트용 카피 */
  description?: string
  /** "확인하러 가기" — 구독 요금제 화면 이동은 페이지가 처리 */
  onConfirm?: () => void
  className?: string
}

/**
 * 리포트 PRO 결제 유도 카드 (Figma: Card_요금제 현질유도 1194:14859).
 * 구독 전 잠긴 화면 위에 띄운다 — 🎫 티켓 + 타이틀 + PRO 안내 +
 * [확인하러 가기] + 구분선 + Pro 혜택 목록. 흰 카드, key 색 테두리, rounded-16.
 * 리포트·지도가 같은 카드를 쓰므로 타이틀·안내문은 화면별로 갈아끼운다.
 */
export function ReportPaywallCard({
  title = '내 가게에 맞는 대응 전략을\n확인해보세요',
  description = 'PRO에서 상권 분석 리포트 전체를\n확인할 수 있어요.',
  onConfirm,
  className,
}: ReportPaywallCardProps) {
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
          <p className="text-title-m-bold whitespace-pre-line text-gray-900">{title}</p>
        </div>
        <p className="text-body-l-medium whitespace-pre-line text-gray-600">{description}</p>
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
        <p className="text-body-l-semibold text-gray-700">Pro 혜택</p>
        <ul className="flex flex-col gap-1.5 text-body-m-medium text-gray-600">
          {PRO_BENEFITS.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
