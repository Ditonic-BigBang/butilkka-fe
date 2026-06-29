import { GradeGauge } from '@/components/charts/GradeGauge'
import { GradeTrend } from '@/components/charts/GradeTrend'

/* ────────────────────────────────────────────────────────────
   Figma '등급 카드' 변환 — '이번 분기' 게이지 + '3년 추이' 추이차트.
   Figma 는 두 개의 #fafafa 서브카드를 세로로 쌓은 구성.
──────────────────────────────────────────────────────────── */

type GradeCardProps = {
  /** 현재(이번 분기) 등급 */
  grade?: string
  /** 지난 분기 등급 */
  previousGrade?: string
}

export function GradeCard({ grade = 'C', previousGrade = 'B' }: GradeCardProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 이번 분기 — 반원 게이지 */}
      <section className="rounded-2xl bg-[#fafafa] px-5 pt-[18px] pb-5">
        <h3 className="text-base font-semibold text-[#6e6e6e]">이번 분기</h3>
        <div className="relative flex flex-col items-center">
          <GradeGauge value={grade} />
          {/* 지난 분기 등급 pill — 게이지 하단에 살짝 겹침 */}
          <div className="-mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-[0_0_4px_rgba(0,0,0,0.06)]">
            <span className="text-[#676767]">지난 분기 등급</span>
            <span className="font-medium text-[#1f1f1f]">{previousGrade}등급</span>
          </div>
        </div>
      </section>

      {/* 3년 추이 — 등급축 영역차트 */}
      <section className="rounded-2xl bg-[#fafafa] px-5 pt-[18px] pb-5">
        <h3 className="mb-3 text-base font-semibold text-[#6e6e6e]">3년 추이</h3>
        <GradeTrend />
      </section>
    </div>
  )
}
