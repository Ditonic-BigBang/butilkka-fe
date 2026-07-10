import { useNavigate } from 'react-router-dom'
import ChevronRight from '~icons/ci/chevron-right'
import { MobileLayout } from '@/widgets/mobile-layout'
import { useThemeColor } from '@/shared/lib/useThemeColor'
import {
  AnalysisCard,
  InsightCard,
  ReportLinkButton,
  ScoreCard,
  SimilarCaseCard,
  Sparkle,
} from '@/entities/report'
import { RankedDistrictCard } from '@/entities/district'
import { useLatestReport, useReportHistory, type ReportView } from './model/useLatestReport'
import { pickAnalysisIcon } from './lib/analysisIcons'
import { formatQuarter } from './lib/reportFormat'

/**
 * AI 리포트 (Figma: [3] AI 리포트/[3-1] 기본 267:4266·4528 · API: GET /api/v1/reports/latest).
 * 상권 점수 + 이전 리포트 버튼 + AI 종합 전망 + 원인 분석·선행 신호 + 유사 사례(가로 스크롤)
 * + AI 추천(버티기/이동에 따라 타이틀·대체 상권 섹션이 갈림).
 */
export default function ReportPage() {
  const navigate = useNavigate()
  const report = useLatestReport()
  const history = useReportHistory()
  // 리포트 배경(gray-70)에 노치·상태바 색을 맞춰 이어 보이게 (Android 상태바 색)
  useThemeColor('#f7f7f7')

  // 이전 분기 리포트 (히스토리에서 현재 분기보다 앞선 첫 항목) — 없으면 버튼 숨김
  const previous = report.data
    ? history.data?.find((r) => r.quarter < report.data.quarter)
    : undefined

  let content
  if (report.isPending) {
    content = <ReportSkeleton />
  } else if (report.isError) {
    content = <ReportError onRetry={() => report.refetch()} />
  } else {
    content = (
      <ReportContent data={report.data} previous={previous} onViewMap={() => navigate('/map')} />
    )
  }

  return (
    // className: 프레임(노치 영역 포함) 배경을 gray-70 로 → iOS 노치가 리포트 배경과 이어짐
    <MobileLayout className="bg-gray-70">
      <div className="min-h-full bg-gray-70">
        <ReportHeader region={report.data?.regionName} category={report.data?.categoryName} />
        {content}
      </div>
    </MobileLayout>
  )
}

/** 상단 헤더 — "AI 리포트" 타이틀 + 상권·업종 (데이터 로드 전엔 타이틀만) */
function ReportHeader({ region, category }: { region?: string; category?: string }) {
  return (
    <header className="flex flex-col gap-1 bg-gray-70 px-5 py-4">
      <h1 className="text-title-s-semibold text-gray-900">AI 리포트</h1>
      {region && category && (
        <div className="flex items-center gap-1 text-body-m-regular text-gray-400">
          <span>{region} 인근</span>
          <span aria-hidden className="size-0.5 rounded-full bg-gray-200" />
          <span>{category}</span>
        </div>
      )}
    </header>
  )
}

/** 분석 항목 라벨에 어울리는 아이콘 (orange 18px — AnalysisCard 관례) */
function AnalysisIcon({ label }: { label: string }) {
  const Icon = pickAnalysisIcon(label)
  return <Icon aria-hidden className="size-[18px] shrink-0 text-orange-400" />
}

type ReportContentProps = {
  data: ReportView
  /** 이전 분기 리포트 (없으면 이동 버튼 숨김) */
  previous?: { quarter: string; grade: string }
  /** 대체 상권 "지도에서 확인하기" */
  onViewMap: () => void
}

/** 리포트 본문 — 점수/전망/분석 카드 + 유사 사례 + AI 추천 */
function ReportContent({ data, previous, onViewMap }: ReportContentProps) {
  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-1">
        <ScoreCard
          period={data.period}
          type={data.declineType}
          grade={data.grade}
          status={data.status}
          gaugeLabel="쇠퇴 위험도"
          progress={data.progress}
          description={data.briefing}
        />

        {/* TODO(리포트 히스토리): 이전 리포트 목록 화면 구현 시 onClick 네비게이션 연결 */}
        {previous && (
          <ReportLinkButton quarter={formatQuarter(previous.quarter)} grade={previous.grade} />
        )}

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

      {/* 유사 사례 — 가로 스크롤 카드 */}
      <section className="mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-title-s-semibold text-gray-900">유사 사례</h2>
          {/* TODO(유사 사례): 전체 목록 화면(/api/v1/reports/{id}/cases) 구현 시 이동 연결 */}
          <button
            type="button"
            className="flex items-center gap-1 text-body-m-medium text-gray-500"
          >
            전체 보기
            <ChevronRight aria-hidden className="size-4 shrink-0 text-gray-300" />
          </button>
        </div>
        <div className="flex [scrollbar-width:none] gap-3 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
          {data.similarCases.map((c) => (
            <SimilarCaseCard
              key={c.caseId}
              region={c.region}
              period={c.period}
              summary={c.summary}
              className="w-[286px] shrink-0"
            />
          ))}
        </div>
      </section>

      {/* 섹션 구분 밴드 */}
      <div className="mt-5 h-[13px] bg-gray-90" />

      {/* AI 추천 — 버티기/이동에 따라 타이틀·대체 상권 섹션이 갈림 */}
      <section className="flex flex-col gap-6 px-5 pt-5 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-key">
              <Sparkle className="size-[17px] shrink-0" />
              <span className="text-body-m-semibold">AI 추천</span>
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
      </section>
    </>
  )
}

/** 로딩 스켈레톤 — 본문 카드 형태의 회색 플레이스홀더 */
function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-5 pt-1 pb-6">
      <div className="h-[188px] animate-pulse rounded-14 bg-white" />
      <div className="h-[52px] animate-pulse rounded-12 bg-white" />
      <div className="h-[232px] animate-pulse rounded-14 bg-white" />
      <div className="h-[158px] animate-pulse rounded-12 bg-white" />
      <div className="h-[158px] animate-pulse rounded-12 bg-white" />
    </div>
  )
}

/** 에러 — 재시도 */
function ReportError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-body-l-medium text-gray-500">리포트를 불러오지 못했어요</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
      >
        다시 시도
      </button>
    </div>
  )
}
