import { useEffect, useState } from 'react'

/** :root 의 CSS 변수 실제 값 읽기 (index.css @theme 과 항상 동기) */
function useVar(name: string) {
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  }, [name])
  return value
}

// ───────────────────── 색상 ─────────────────────
const BRAND = [
  'key',
  'orange-10',
  'orange-50',
  'orange-100',
  'orange-200',
  'orange-300',
  'orange-400',
  'orange-500',
  'orange-600',
  'orange-700',
]
const GRAY = [
  'gray-70',
  'gray-90',
  'gray-100',
  'gray-200',
  'gray-300',
  'gray-400',
  'gray-500',
  'gray-600',
  'gray-700',
  'gray-800',
  'gray-900',
]
const SEMANTIC = ['status-red', 'status-red-soft', 'info-blue', 'info-blue-soft']

function ColorCard({ token }: { token: string }) {
  const hex = useVar(`--color-${token}`)
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-16 w-full rounded-10 border border-gray-100"
        style={{ backgroundColor: `var(--color-${token})` }}
      />
      <div className="flex flex-col leading-tight">
        <span className="text-body-m-semibold text-gray-900">{token}</span>
        <span className="text-caption-l-regular text-gray-400">{hex.toUpperCase() || '—'}</span>
      </div>
    </div>
  )
}

function ColorGroup({ label, tokens }: { label: string; tokens: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-body-l-semibold text-gray-700">{label}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {tokens.map((t) => (
          <ColorCard key={t} token={t} />
        ))}
      </div>
    </div>
  )
}

// ───────────────────── 타이포그래피 ─────────────────────
const TYPE = [
  { cls: 'text-headline-medium', px: 40, w: 'Medium 500', use: '큰 숫자·헤드라인' },
  { cls: 'text-title-l-medium', px: 28, w: 'Medium 500', use: '페이지 타이틀' },
  { cls: 'text-title-m-bold', px: 24, w: 'Bold 700', use: '섹션 타이틀(강)' },
  { cls: 'text-title-m-semibold', px: 24, w: 'SemiBold 600', use: '섹션 타이틀' },
  { cls: 'text-title-s-semibold', px: 20, w: 'SemiBold 600', use: '소제목' },
  { cls: 'text-body-l-semibold', px: 16, w: 'SemiBold 600', use: 'CTA·강조 본문' },
  { cls: 'text-body-l-medium', px: 16, w: 'Medium 500', use: '본문(중)' },
  { cls: 'text-body-l-regular', px: 16, w: 'Regular 400', use: '본문' },
  { cls: 'text-body-m-semibold', px: 14, w: 'SemiBold 600', use: '버튼 라벨' },
  { cls: 'text-body-m-medium', px: 14, w: 'Medium 500', use: '보조 본문' },
  { cls: 'text-body-m-regular', px: 14, w: 'Regular 400', use: '보조 본문' },
  { cls: 'text-caption-l-semibold', px: 12, w: 'SemiBold 600', use: '캡션(강)' },
  { cls: 'text-caption-l-medium', px: 12, w: 'Medium 500', use: '태그 라벨' },
  { cls: 'text-caption-l-regular', px: 12, w: 'Regular 400', use: '캡션' },
  { cls: 'text-caption-m-regular', px: 10, w: 'Regular 400', use: '최소 캡션' },
]

function TypeScale() {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {TYPE.map((t) => (
        <div key={t.cls} className="py-4">
          <p className={t.cls}>다람쥐 헌 쳇바퀴 Aa 123</p>
          <p className="mt-2 text-caption-l-regular text-gray-400">
            <code className="text-caption-l-medium text-gray-600">{t.cls}</code>
            <span>
              {' '}
              · {t.px}px · {t.w} · {t.use}
            </span>
          </p>
        </div>
      ))}
    </div>
  )
}

// ───────────────────── Radius / Shadow / Gradient ─────────────────────
const RADII = [
  '--radius-4',
  '--radius-6',
  '--radius-8',
  '--radius-10',
  '--radius-12',
  '--radius-14',
  '--radius-16',
  '--radius-max',
]

function RadiusScale() {
  return (
    <div className="flex flex-wrap gap-5">
      {RADII.map((v) => (
        <div key={v} className="flex flex-col items-center gap-2">
          <div
            className="size-16 border border-gray-200 bg-gray-70"
            style={{ borderRadius: `var(${v})` }}
          />
          <span className="text-caption-l-regular text-gray-500">
            rounded-{v.replace('--radius-', '')}
          </span>
        </div>
      ))}
    </div>
  )
}

const SHADOWS = [
  { name: 'shadow-card', v: '--shadow-card', use: '카드 (Elevation 1)' },
  { name: 'shadow-upper', v: '--shadow-upper', use: '하단 고정 바' },
]

function ShadowScale() {
  return (
    <div className="flex flex-wrap gap-8 p-2">
      {SHADOWS.map((s) => (
        <div key={s.name} className="flex flex-col items-center gap-2">
          <div className="size-20 rounded-12 bg-white" style={{ boxShadow: `var(${s.v})` }} />
          <span className="text-caption-l-medium text-gray-700">{s.name}</span>
          <span className="text-caption-l-regular text-gray-400">{s.use}</span>
        </div>
      ))}
    </div>
  )
}

function GradientScale() {
  return (
    <div className="flex flex-wrap gap-4">
      {['bg-gradation-1', 'bg-gradation-2'].map((cls) => (
        <div key={cls} className="flex flex-col gap-2">
          <div className={`h-16 w-40 rounded-12 ${cls}`} />
          <span className="text-caption-l-regular text-gray-500">{cls}</span>
        </div>
      ))}
    </div>
  )
}

// ───────────────────── Spacing ─────────────────────
// 커스텀 스케일 없음 → Tailwind 기본(1 = 4px). 자주 쓰는 값만 시각화.
const SPACING = [
  { name: '1', px: 4 },
  { name: '1.5', px: 6 },
  { name: '2', px: 8 },
  { name: '2.5', px: 10 },
  { name: '3', px: 12 },
  { name: '3.5', px: 14 },
  { name: '4', px: 16 },
  { name: '5', px: 20 },
  { name: '6', px: 24 },
  { name: '8', px: 32 },
  { name: '10', px: 40 },
  { name: '12', px: 48 },
]

function SpacingScale() {
  return (
    <div className="flex flex-col gap-2">
      {SPACING.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-caption-l-medium text-gray-600">{s.name}</span>
          <div className="h-3 rounded-4 bg-orange-400" style={{ width: s.px }} />
          <span className="text-caption-l-regular text-gray-400">{s.px}px</span>
        </div>
      ))}
    </div>
  )
}

// ───────────────────── Section ─────────────────────
function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="border-b border-gray-100 pb-2">
        <h2 className="text-title-s-semibold text-gray-900">{title}</h2>
        {desc && <p className="mt-1 text-body-m-regular text-gray-500">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

/** 디자인 토큰 시각 문서 — 값은 CSS 변수에서 직접 읽어옴(index.css 와 동기). */
export function DesignTokens() {
  return (
    <div className="flex max-w-3xl flex-col gap-12 py-4 font-sans">
      <Section title="색상" desc="색은 hex 유지(디자이너 대조 쉽게). 스와치는 실제 CSS 변수 값.">
        <ColorGroup label="Brand (Orange)" tokens={BRAND} />
        <ColorGroup label="Gray" tokens={GRAY} />
        <ColorGroup label="Semantic" tokens={SEMANTIC} />
      </Section>

      <Section
        title="타이포그래피"
        desc="클래스 하나(text-*)에 size·weight·line-height·자간 전부 포함."
      >
        <TypeScale />
      </Section>

      <Section
        title="Spacing"
        desc="커스텀 토큰 없음 → Tailwind 기본 스케일(1 = 4px). p-/px-/gap- 등에 사용. iOS 노치는 pt-safe-top·pb-safe-bottom-or-3 안전영역 유틸."
      >
        <SpacingScale />
      </Section>

      <Section title="Radius">
        <RadiusScale />
      </Section>

      <Section title="Shadow">
        <ShadowScale />
      </Section>

      <Section title="Gradient" desc="oklch 보간(중간색 칙칙함 회피). bg-gradation-* 유틸.">
        <GradientScale />
      </Section>
    </div>
  )
}
