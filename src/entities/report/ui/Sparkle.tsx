/**
 * AI 인사이트 표시용 4점 스파클(✦) — currentColor 로 색 제어.
 * InsightCard·SimilarCaseCard 라벨과 리포트 페이지 "AI 추천" 라벨이 공유한다.
 */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 1.5c.45 5.4 5.1 10.05 10.5 10.5-5.4.45-10.05 5.1-10.5 10.5-.45-5.4-5.1-10.05-10.5-10.5C6.9 11.55 11.55 6.9 12 1.5Z" />
    </svg>
  )
}
