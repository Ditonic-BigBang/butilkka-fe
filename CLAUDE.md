# CLAUDE.md

버틸까(butilkka) — 상권 쇠퇴 분석 모바일 웹앱 (신한 해커톤). 이 파일은 AI 에이전트·기여자를 위한 프로젝트 규칙이다.

## 스택

- React 19 + Vite + TypeScript, 패키지 매니저 **pnpm**
- Tailwind CSS **v4** (CSS-first `@theme`) · `tailwind-variants`
- TanStack Query(서버 상태) · Zustand(클라 상태) · React Router
- 테스트: **Vitest** (jsdom 프로젝트 + Storybook 브라우저 테스트/Playwright chromium)
- **PWA**: `vite-plugin-pwa` 설치형 (manifest·워크박스 선캐시는 `vite.config.ts`, 아이콘 생성은 `pwa-assets.config.ts`). 선캐시 `globPatterns`는 청크 파일명에 의존 — 빌드 로그에 "glob doesn't match" 경고가 뜨면 패턴 갱신.

## 아키텍처: Feature-Sliced Design (FSD)

`src/`는 FSD 레이어로 구성. **import 규칙: 위 레이어는 아래 레이어만 import** (같은 레이어 슬라이스끼리 import 금지, `app`·`shared`는 예외).

```
app/       초기화·프로바이더·전역 스타일   (App, main, index.css)
pages/     화면 (라우트 진입, features/widgets 조합)
widgets/   큰 독립 UI 블록                (mobile-layout, district-map, report-overview …)
features/  사용자 액션/기능              (auth) — "여러 페이지 재사용" 될 때만 생성
entities/  비즈니스 엔티티               (district, report, store, session …)
shared/    재사용·도메인 없음 (ui·lib·api·types·assets) — slice 없이 segment 구조
```

### 새 코드 어디에 두나

- **명사(것)** → `entities/` (예: `entities/report`, `entities/store`)
- **동사(행동)** → `features/` — 단, 여러 페이지에서 재사용될 때만 (과도한 feature 금지)
- **큰 조합 블록** → `widgets/` · **화면** → `pages/` · **도메인 없는 재사용** → `shared/`
- `pages`는 **라우트 1개 = 슬라이스 1개** (같은 플로우여도 화면마다 분리: `my-store`/`my-store-edit`, `subscription`/`subscription-complete`). 두 화면이 asset·데이터를 공유하면 아래 레이어(`entities`/`shared`)로 내려 공유 — 페이지끼리 import 금지

### 슬라이스 규칙

- 슬라이스마다 **`index.ts` 공개 API만 노출** (내부는 캡슐화, 외부는 `@/entities/foo`로 import). **예외: `pages`는 배럴 없음** — 최상위 레이어라 소비자가 라우터·prefetch뿐이고, 코드 분할을 위해 `@/pages/home/HomePage`처럼 페이지 파일을 직접 lazy import
- 세그먼트: `ui/`(컴포넌트) `model/`(상태·로직·데이터) `api/` `lib/`
- **test·story는 컴포넌트 옆에 colocation** (`ui/Foo.tsx` + `Foo.test.tsx` + `Foo.stories.tsx`)
- 엔티티끼리 참조는 `entities/<x>/@x/<y>.ts` public API로
- **쿼리 키는 팩토리로 소유 슬라이스에 colocation** (`fooKeys = { all: [...], detail: (id) => [...fooKeys.all, id] }` — TkDodo 패턴, 예: `store-location-picker/model/useAddressSearch.ts`). 전역 queryKeys 파일 금지, 외부에서 무효화할 때만 public API로 승격.

## 디자인 시스템

- **토큰**: `src/app/index.css`의 `@theme` (색상·타이포 `text-*`·radius·shadow·gradient). Figma 변수 → 수동 미러링.
- **색상**: hex 유지 (디자이너가 hex로 줌 → 대조 쉬움). 색↔색 그라데이션은 `in oklch` 보간(중간색 데드존 회피), 단 **투명으로 페이드하는 건 sRGB**(oklch 투명 보간은 색 뜸).
- **폰트**: Pretendard Variable (CDN, `index.html`), 자간 `-0.02em`(-2%)
- **아이콘**: 단색 라인 아이콘은 coolicons via `unplugin-icons` → `import Icon from '~icons/ci/<name>'` (`currentColor`라 `text-*`로 색 제어). **브랜드 로고·복잡한 일러스트**(혜택/성공/온보딩 등 다색·그라데이션)는 로컬 SVG — Figma `use_figma` `exportAsync(SVG_STRING)`로 통짜 추출해 소유 슬라이스 `assets/`에 저장 후 `<img src>` (조각 재조립 금지).
- **컴포넌트**: `tailwind-variants`(`tv`) 패턴 (shadcn 스타일), 즉석 조건부 병합은 `cn`(`@/shared/lib/cn`). Tailwind v4에선 `tv` 내장 responsive variant 대신 `sm:` 프리픽스 직접 사용. 스토리는 모바일 뷰포트 기본.

## 명령어

- `pnpm dev` · `pnpm build` · `pnpm test:run` · `pnpm storybook` · `pnpm build-storybook`
- `pnpm lint`(oxlint) · `pnpm typecheck` · `pnpm format` · `pnpm performance:check`(빌드+성능 예산 검사)
- 커밋 전 husky(lint-staged)가 `oxlint --fix`→`prettier` 자동 실행. 커밋 메시지: `[type] 제목` — type은 feat/fix/docs/test/refactor/style/chore (commitlint 강제, 한글 명령형·한 커밋 = 한 가지 일).
- 경로 별칭 `@/` = `src/`. 포맷: 세미콜론 없음·작은따옴표·행 100. Tailwind 클래스 순서는 prettier 플러그인이 자동 정렬 (신경 안 써도 됨).

## 성능

- 시연용 **첫 로딩·첫 진입 우선**. 최적화 내역·전후 실측 수치·함정은 `docs/performance-optimization.md`.
- `src/app/prefetch.ts`는 **동적 import 유지 필수** — 정적 import로 바꾸면 코드 분할이 깨져 엔트리가 다시 커진다. 예산: 엔트리 gzip 120KB·PWA 프리캐시 460KiB (`scripts/check-performance.mjs`).

## 워크플로우

- 브랜치: **`dev`에서 분기** — `prefix/작업-내용`(소문자·하이픈, prefix는 커밋 type과 동일 — 예: `feat/onboarding`) → PR → **`dev`** → PR → **`main`**(프로덕션, 직접 push 금지)
- CI(GitHub Actions, `.github/workflows/ci.yml`): main·dev push/PR마다 lint → format check → typecheck → 테스트(Storybook 브라우저 테스트용 chromium 설치 포함) → 빌드. PR에선 커밋 컨벤션 검사 추가, 결과는 Discord 알림.
- Vercel 프로젝트 2개: **앱**(`pnpm build`→`dist`) / **Storybook**(`pnpm build-storybook`→`storybook-static`)
- **프로덕션 도메인**: 앱 = `https://butilkka.site` (Vercel 커스텀 도메인) · 백엔드 = AWS. 카카오맵 JS SDK는 도메인 허용목록을 강제하므로 새 도메인은 **카카오 개발자 콘솔(Web 플랫폼)에 등록** 필요. 인증은 쿠키(`credentials: 'include'`) 기반이라 백엔드를 `api.butilkka.site`로 두면 same-site(쿠키 간단), 다른 호스트면 `SameSite=None; Secure`+CORS 필요.
- **배포 모드**: 실서버 API 사용 — Vercel 환경변수 `VITE_API_BASE_URL=https://api.butilkka.site`. **MSW는 로컬 dev 전용**: `main.tsx`가 `import.meta.env.DEV` + `VITE_ENABLE_MSW=true`일 때만 워커를 시작하므로 프로덕션 빌드에선 env를 켜도 목이 뜨지 않는다. 로컬 목 개발은 `.env`에 `VITE_ENABLE_MSW=true`. Vite env는 빌드타임이라 변경 후 재배포 필요. (`.env`는 gitignore라 배포 설정은 전부 Vercel 대시보드 환경변수로)
- 이슈 → 브랜치 → 커밋 → PR (`Resolve: #N`)
- **이슈 생성 시 라벨을 반드시 붙인다** (feat/fix/refactor 등 성격에 맞게)
- **PR·이슈 본문은 `.github/`의 템플릿 형식을 반드시 따른다** (`pull_request_template.md`, `ISSUE_TEMPLATE/`)
