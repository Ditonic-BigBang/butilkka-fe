import cases from '../assets/benefit-cases.svg'
import strategy from '../assets/benefit-strategy.svg'
import report from '../assets/benefit-report.svg'
import pdf from '../assets/benefit-pdf.svg'

/**
 * 리포트 PRO 구독 혜택 아이콘 (Figma 구독 혜택 일러스트, 52px 벡터).
 * 구독 요금제(pages/subscription)·완료(pages/subscription-complete) 화면이 공유하므로
 * 두 페이지가 각자 소유하지 않도록 report 엔티티가 보유한다.
 */
export const reportBenefitIcons = { cases, strategy, report, pdf } as const
