import type { ReactNode } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { ColoredBar, ColoredSlice } from '@/components/charts/ChartShapes'
import { GradeCard } from '@/components/charts/GradeCard'

/* ────────────────────────────────────────────────────────────
   Recharts 커스터마이즈 데모 페이지.
   - 그라데이션 Area / 라운드·셀별 색상 Bar / 커스텀 도트 Line / 도넛 Pie
   - 커스텀 툴팁(React 컴포넌트 + Tailwind), 커스텀 축, 브랜드 팔레트
   실제 데이터 아님(목업). "Recharts 로 디자인이 어디까지 되나" 확인용.
──────────────────────────────────────────────────────────── */

const PALETTE = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
} as const

// 공통 축 스타일 — 선/틱 없애고 회색 라벨만 (깔끔한 모바일 대시보드 톤)
const AXIS = {
  tick: { fontSize: 11, fill: '#9ca3af' },
  tickLine: false,
  axisLine: false,
} as const

// 큰 숫자는 좁은 모바일 축에서 'k' 로 축약 (1240 → 1.2k)
const kFmt = (v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)

const weekly = [
  { day: '월', v: 1240 },
  { day: '화', v: 1680 },
  { day: '수', v: 1520 },
  { day: '목', v: 2010 },
  { day: '금', v: 2480 },
  { day: '토', v: 3120 },
  { day: '일', v: 2890 },
]

const districts = [
  { name: '강남', score: 82, color: PALETTE.indigo },
  { name: '마포', score: 74, color: PALETTE.violet },
  { name: '성동', score: 69, color: PALETTE.sky },
  { name: '용산', score: 63, color: PALETTE.emerald },
  { name: '관악', score: 51, color: PALETTE.amber },
]

const trend = [
  { month: '1월', 임대료: 92, 소득: 78 },
  { month: '2월', 임대료: 95, 소득: 80 },
  { month: '3월', 임대료: 99, 소득: 81 },
  { month: '4월', 임대료: 104, 소득: 83 },
  { month: '5월', 임대료: 108, 소득: 86 },
  { month: '6월', 임대료: 113, 소득: 88 },
]

const breakdown = [
  { name: '주거비', value: 42, color: PALETTE.indigo },
  { name: '식비', value: 24, color: PALETTE.violet },
  { name: '교통', value: 16, color: PALETTE.sky },
  { name: '여가', value: 11, color: PALETTE.emerald },
  { name: '기타', value: 7, color: PALETTE.amber },
]

function ChartCard({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-sm font-bold tracking-tight text-gray-900">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-gray-400">{desc}</p>}
      </header>
      {children}
    </section>
  )
}

export default function ChartSamplePage() {
  return (
    <div className="min-h-dvh bg-gray-50 px-4 pt-6 pb-12">
      <h1 className="mb-1 text-xl font-bold tracking-tight text-gray-900">차트 샘플</h1>
      <p className="mb-5 text-xs text-gray-400">Recharts 커스터마이즈 확인용 (목업 데이터)</p>

      <div className="flex flex-col gap-4">
        {/* 0) Figma 변환: 등급 카드 (게이지 + 추이) */}
        <ChartCard title="등급 카드" desc="Figma 컴포넌트 변환 · 반원 게이지 + 등급 추이">
          <GradeCard grade="C" previousGrade="B" />
        </ChartCard>

        {/* 1) 그라데이션 Area + 커스텀 툴팁 */}
        <ChartCard title="주간 관심도" desc="그라데이션 채움 · 커스텀 툴팁">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.indigo} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PALETTE.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" {...AXIS} />
              <YAxis {...AXIS} width={32} tickFormatter={kFmt} />
              <Tooltip
                cursor={{ stroke: PALETTE.indigo, strokeDasharray: 4 }}
                content={<ChartTooltip unit="명" />}
              />
              <Area
                type="monotone"
                dataKey="v"
                name="방문"
                stroke={PALETTE.indigo}
                strokeWidth={2.5}
                fill="url(#areaFill)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2) 라운드 Bar + 셀별 색상 */}
        <ChartCard title="자치구별 버티기 점수" desc="라운드 모서리 · 막대별 개별 색상">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={districts} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" {...AXIS} />
              <YAxis {...AXIS} width={32} domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                content={<ChartTooltip unit="점" />}
              />
              {/* shape prop 으로 막대별 색상 + 라운드 (deprecated Cell 대체) */}
              <Bar dataKey="score" name="점수" maxBarSize={36} shape={ColoredBar} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3) 멀티 라인 + 커스텀 도트 */}
        <ChartCard title="월별 추이" desc="2개 시리즈 · 커스텀 도트/액티브도트">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" {...AXIS} />
              <YAxis {...AXIS} width={32} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="임대료"
                stroke={PALETTE.rose}
                strokeWidth={2.5}
                dot={{ r: 3, fill: PALETTE.rose, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="소득"
                stroke={PALETTE.emerald}
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4) 도넛 + 커스텀 범례 */}
        <ChartCard title="지출 비중" desc="도넛 · 커스텀 범례(직접 렌더)">
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="55%" height={150}>
              <PieChart>
                <Tooltip content={<ChartTooltip unit="%" />} />
                {/* shape prop 으로 조각별 색상 (deprecated Cell 대체) */}
                <Pie
                  data={breakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={2}
                  stroke="none"
                  shape={ColoredSlice}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Recharts <Legend> 대신 직접 그린 범례 — 레이아웃 완전 제어 */}
            <ul className="flex-1 space-y-1.5">
              {breakdown.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                  <span className="ml-auto font-semibold text-gray-900 tabular-nums">
                    {d.value}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
