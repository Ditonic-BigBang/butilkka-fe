/**
 * 일반 회원 vs 구독 회원 비교표 (Figma: [4-9] 요금제 과정 1248:14839).
 * 회색(일반) 배경 위로 오렌지(구독) 배경이 위·아래 12px씩 튀어나와 강조된다.
 * 행은 하나의 그리드로 합쳐 좌우 컬럼이 항상 같은 y에 정렬되고,
 * 구분선은 데이터 행 사이(5줄)에만, 회색부+오렌지부가 한 줄로 이어지게 긋는다(헤더 밑엔 없음).
 */

// feature 는 \n 으로 2줄 표기. normal/pro 는 O·X 또는 문구.
const ROWS = [
  { feature: '쇠퇴 등급 분류', normal: 'O', pro: 'O' },
  { feature: 'AI 종합 전망과\n원인 분석', normal: 'O', pro: 'O' },
  { feature: '유사 사례 제공', normal: 'X', pro: 'O' },
  { feature: '내 가게에 맞는\n대응 전략 추천', normal: 'X', pro: 'O' },
  { feature: '리포트 조회', normal: '직전 분기까지', pro: '최근 3년까지' },
  { feature: '상세 리포트\nPDF 다운', normal: 'X', pro: 'O' },
]

export function ComparisonTable() {
  return (
    <div className="relative h-[444px] w-full">
      {/* 배경: 일반(회색) — 위아래 12px 안쪽 */}
      <div className="absolute inset-x-0 top-3 h-[420px] rounded-14 bg-gray-70" />
      {/* 배경: 구독(오렌지) — 위아래로 튀어나와 강조 */}
      <div className="absolute top-0 right-0 h-[444px] w-30 rounded-14 bg-key shadow-card" />

      {/* 행 그리드 (배경 위) — 회색 영역과 정확히 겹치도록 top-3 정렬 */}
      <div className="absolute inset-x-0 top-3 flex h-[420px] flex-col">
        {/* 헤더 (구분선 없음) */}
        <div className="flex h-15 items-center">
          <span className="flex-1" />
          <span className="w-32 text-center text-body-m-semibold text-gray-600">일반</span>
          <span className="w-30 text-center text-body-m-semibold text-white">구독</span>
        </div>
        {ROWS.map((row, i) => (
          <div key={row.feature} className="relative flex h-15 items-center">
            <span className="flex-1 pl-5 text-body-m-medium leading-tight whitespace-pre-line text-gray-600">
              {row.feature}
            </span>
            <span className="w-32 text-center text-body-m-medium text-gray-600">{row.normal}</span>
            <span className="w-30 text-center text-body-m-semibold text-white">{row.pro}</span>
            {/* 행 구분선 — 회색부(연회색) + 오렌지부(옅은 흰)가 같은 y로 이어짐, 마지막 행 제외 */}
            {i < ROWS.length - 1 && (
              <>
                <span className="absolute right-30 bottom-0 left-5 h-px bg-gray-100" />
                <span className="absolute right-0 bottom-0 h-px w-30 bg-white/25" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
