import type { ReactNode } from 'react'
import { AnalysisCard, InsightCard, ScoreCard, SimilarCaseCard, Sparkle } from '@/entities/report'
import { RankedDistrictCard } from '@/entities/district'
import { Logo } from '@/shared/ui'
import { pickAnalysisIcon } from '../lib/analysisIcons'
import type { ReportView } from '../model/reportView'

/** 캡처 기준 폭 (px) — 페이지 분할·mm 환산의 단일 출처 */
export const PDF_DOC_WIDTH = 420

/** 페이지 분할 시 중간에서 잘리면 안 되는 단위 — downloadReportPdf 가 이 마커로 경계를 측정 */
function Block({ children }: { children: ReactNode }) {
  return <div data-pdf-block>{children}</div>
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="pt-3 pb-1 text-title-s-semibold text-gray-900">{children}</h2>
}

/**
 * PDF 캡처 전용 리포트 문서 — 화면 밖에서 렌더해 통짜 캡처한다 (ReportOverview 의 정적 재구성).
 * 화면과 다른 점: 유사 사례가 가로 스크롤 대신 세로 나열, 대체 상권 카드는 펼침 고정(readOnly),
 * 내비게이션 버튼("이전 리포트"·"전체 보기" 등) 없음, `locked`면 유료 섹션 자체를 렌더하지 않음.
 * motion-static 으로 등장 애니메이션을 최종 상태로 고정해 캡처 시점 문제를 없앤다.
 */
export function ReportPdfDocument({
  view,
  locked = false,
}: {
  view: ReportView
  locked?: boolean
}) {
  const generatedAt = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      className="flex motion-static flex-col gap-3 bg-gray-70 p-6 font-sans"
      style={{ width: PDF_DOC_WIDTH }}
    >
      {/* 문서 헤더 — 로고 + 타이틀 + 상권·업종·분기 */}
      <Block>
        <div className="flex flex-col gap-3 pb-2">
          <Logo variant="solid" className="h-6" />
          <div className="flex flex-col gap-1">
            <h1 className="text-title-s-semibold text-gray-900">AI 리포트</h1>
            <p className="text-body-m-regular text-gray-400">
              {view.regionName} 인근 · {view.categoryName} · {view.period}
            </p>
          </div>
        </div>
      </Block>

      <Block>
        <ScoreCard
          period={view.period}
          type={view.declineType}
          grade={view.grade}
          status={view.status}
          gaugeLabel="쇠퇴 위험도"
          progress={view.progress}
          description={view.briefing}
        />
      </Block>

      <Block>
        <InsightCard label="AI 종합 전망" description={view.aiOutlook} />
      </Block>

      <Block>
        <AnalysisCard
          title="원인 분석"
          items={view.causes.map((c) => {
            const Icon = pickAnalysisIcon(c.label)
            return {
              icon: <Icon aria-hidden className="size-[18px] shrink-0 text-orange-400" />,
              label: c.label,
              value: c.value,
            }
          })}
        />
      </Block>

      <Block>
        <AnalysisCard
          title="선행 신호"
          items={view.signals.map((label) => {
            const Icon = pickAnalysisIcon(label)
            return {
              icon: <Icon aria-hidden className="size-[18px] shrink-0 text-orange-400" />,
              label,
            }
          })}
        />
      </Block>

      {/* 유료(PRO) 섹션 — locked 면 문서에서 통째로 제외 (블러 캡처로 새는 것 방지) */}
      {!locked && (
        <>
          {view.similarCases.map((c, i) => (
            <Block key={c.caseId}>
              {i === 0 && <SectionTitle>유사 사례</SectionTitle>}
              <SimilarCaseCard region={c.region} period={c.period} summary={c.summary} />
            </Block>
          ))}

          <Block>
            <div className="flex flex-col gap-4 pt-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-key">
                  <Sparkle className="size-[17px] shrink-0" />
                  <span className="text-body-m-semibold">AI 추천</span>
                </div>
                <h2 className="text-title-s-semibold text-gray-900">{view.recommendationTitle}</h2>
              </div>
              <InsightCard
                variant="highlight"
                label="추천 이유"
                heading={view.reason.title}
                description={view.reason.description}
              />
            </div>
          </Block>

          {view.alternatives.map((region, i) => (
            <Block key={region.rank}>
              {i === 0 && <SectionTitle>{view.alternativesTitle}</SectionTitle>}
              <RankedDistrictCard
                rank={region.rank}
                name={region.name}
                description={region.description}
                stats={region.stats}
                referenceDate={region.referenceDate}
                readOnly
              />
            </Block>
          ))}
        </>
      )}

      {/* 문서 푸터 */}
      <Block>
        <p className="pt-3 text-center text-caption-l-regular text-gray-300">
          {generatedAt} · 버틸까(butilkka.site)에서 생성된 리포트입니다
        </p>
      </Block>
    </div>
  )
}
