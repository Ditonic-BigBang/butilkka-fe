import type { ReactNode } from 'react'
import ChevronRight from '~icons/ci/chevron-right'
import {
  AnalysisCard,
  InsightCard,
  ReportPaywallCard,
  ScoreCard,
  SimilarCaseCard,
  Sparkle,
} from '@/entities/report'
import { RankedDistrictCard } from '@/entities/district'
import { pickAnalysisIcon } from '../lib/analysisIcons'
import type { ReportView } from '../model/reportView'

/** 분석 항목 라벨에 어울리는 아이콘 (orange 18px — AnalysisCard 관례) */
function AnalysisIcon({ label }: { label: string }) {
  const Icon = pickAnalysisIcon(label)
  return <Icon aria-hidden className="size-[18px] shrink-0 text-orange-400" />
}

type ReportOverviewProps = {
  data: ReportView
  /** 상권 점수 카드 바로 아래 슬롯 (예: 최신 리포트의 "이전 리포트 확인하러 가기" 버튼) */
  afterScore?: ReactNode
  /** 구독 전 잠금 — 유사 사례부터 가리고 결제 유도 카드를 띄운다 (Figma 1219:19236) */
  locked?: boolean
  /** 잠금 카드 "확인하러 가기" — 구독 화면 이동 */
  onUpgrade?: () => void
  /** 유사 사례 "전체 보기" */
  onViewAllCases: () => void
  /** 대체 상권 "지도에서 확인하기" */
  onViewMap: () => void
}

/** 유사 사례 섹션 — 타이틀·전체 보기 + 가로 스크롤 카드 (잠금 상태에선 미리보기로도 쓰임) */
function CasesSection({
  data,
  onViewAllCases,
}: Pick<ReportOverviewProps, 'data' | 'onViewAllCases'>) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-title-s-semibold text-gray-900">유사 사례</h2>
        <button
          type="button"
          onClick={onViewAllCases}
          className="flex press items-center gap-1 text-body-m-medium text-gray-500"
        >
          전체 보기
          <ChevronRight aria-hidden className="size-4 shrink-0 text-gray-300" />
        </button>
      </div>
      <div className="scrollbar-hide flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5">
        {data.similarCases.map((c) => (
          <SimilarCaseCard
            key={c.caseId}
            region={c.region}
            period={c.period}
            summary={c.summary}
            className="w-[286px] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  )
}

/**
 * AI 리포트 본문 (Figma: [3-1] 기본 · [3-4] 지난 리포트 상세보기 공통 영역).
 * 점수/전망/분석 카드 + 유사 사례(가로 스크롤) + AI 추천(버티기/이동) + 대체 상권.
 * 최신(pages/report)·지난(pages/report-detail) 리포트 화면이 공유하는 조합 블록.
 * `locked`(구독 전)면 유사 사례부터 그라데이션+블러로 가리고 결제 유도 카드를 띄운다.
 */
export function ReportOverview({
  data,
  afterScore,
  locked = false,
  onUpgrade,
  onViewAllCases,
  onViewMap,
}: ReportOverviewProps) {
  return (
    <>
      {/* 상단 카드 컬럼 — 진입 시 순차 페이드업 */}
      <div className="flex stagger-fade-up flex-col gap-3 px-5 pt-1">
        <ScoreCard
          period={data.period}
          type={data.declineType}
          grade={data.grade}
          status={data.status}
          gaugeLabel="쇠퇴 위험도"
          progress={data.progress}
          description={data.briefing}
        />

        {afterScore}

        <InsightCard label="AI 종합 전망" description={data.aiOutlook} />

        <AnalysisCard
          title="원인 분석"
          items={data.causes.map((c) => ({
            icon: <AnalysisIcon label={c.label} />,
            label: c.label,
            value: c.value,
          }))}
        />

        <AnalysisCard
          title="선행 신호"
          items={data.signals.map((label) => ({
            icon: <AnalysisIcon label={label} />,
            label,
          }))}
        />
      </div>

      {/* 구독 전 — 유사 사례 미리보기 위에 그라데이션+블러 + 결제 유도 카드 (이하 섹션 미노출) */}
      {locked ? (
        <div className="relative mt-5">
          {/* 잠긴 미리보기 — 상단만 살짝 비치고 조작 불가 */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 select-none">
            <CasesSection data={data} onViewAllCases={onViewAllCases} />
          </div>
          {/* 위→아래로 빠르게 가려지는 웜 그레이 페이드 — 투명 페이드라 sRGB 보간 */}
          <div className="absolute inset-0 backdrop-blur-[2px] [background:linear-gradient(to_bottom,rgb(247_247_247/0.3)_0%,rgb(247_247_247/0.9)_19.5%,#f7f7f7_37.2%)]" />
          <div className="relative px-5 pt-[115px] pb-16">
            <ReportPaywallCard onConfirm={onUpgrade} />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <CasesSection data={data} onViewAllCases={onViewAllCases} />
          </div>

          {/* 섹션 구분 밴드 */}
          <div className="mt-5 h-[13px] bg-gray-90" />

          {/* AI 추천 — 버티기/이동에 따라 타이틀·대체 상권 섹션이 갈림 */}
          <section className="flex flex-col gap-6 px-5 pt-5 pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-key">
                  <Sparkle className="size-[17px] shrink-0" />
                  <span className="text-body-m-semibold">{data.recommendationBadge}</span>
                </div>
                <h2 className="text-title-s-semibold text-gray-900">{data.recommendationTitle}</h2>
              </div>
              <InsightCard
                variant="highlight"
                label="추천 이유"
                heading={data.reason.title}
                description={data.reason.description}
              />
            </div>

            {data.alternatives.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-title-s-semibold text-gray-800">{data.alternativesTitle}</h2>
                <div className="flex flex-col gap-3">
                  {data.alternatives.map((region) => (
                    <RankedDistrictCard
                      key={region.rank}
                      rank={region.rank}
                      name={region.name}
                      description={region.description}
                      stats={region.stats}
                      referenceDate={region.referenceDate}
                      onViewMap={onViewMap}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}

/** 로딩 스켈레톤 — 본문 카드 형태의 회색 플레이스홀더 */
export function ReportOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-5 pt-1 pb-6">
      <div className="h-[188px] animate-pulse rounded-14 bg-white" />
      <div className="h-[232px] animate-pulse rounded-14 bg-white" />
      <div className="h-[158px] animate-pulse rounded-12 bg-white" />
      <div className="h-[158px] animate-pulse rounded-12 bg-white" />
    </div>
  )
}
