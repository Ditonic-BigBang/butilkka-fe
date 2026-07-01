# CLAUDE.md

버틸까(butilkka) — 상권 쇠퇴 분석 모바일 웹앱 (신한 해커톤). 이 파일은 AI 에이전트·기여자를 위한 프로젝트 규칙이다.

## 스택

- React 19 + Vite + TypeScript, 패키지 매니저 **pnpm**
- Tailwind CSS **v4** (CSS-first `@theme`) · `tailwind-variants`
- TanStack Query(서버 상태) · Zustand(클라 상태) · React Router
- 테스트: **Vitest** (jsdom 프로젝트 + Storybook 브라우저 테스트/Playwright chromium)

## 아키텍처: Feature-Sliced Design (FSD)

`src/`는 FSD 레이어로 구성. **import 규칙: 위 레이어는 아래 레이어만 import** (같은 레이어 슬라이스끼리 import 금지, `app`·`shared`는 예외).

```
app/       초기화·프로바이더·전역 스타일   (App, main, index.css)
pages/     화면 (라우트 진입, features/widgets 조합)
widgets/   큰 독립 UI 블록                (mobile-layout, district-map)
features/  사용자 액션/기능              (auth) — "여러 페이지 재사용" 될 때만 생성
entities/  비즈니스 엔티티               (district, session)
shared/    재사용·도메인 없음 (ui·lib·api·types·assets) — slice 없이 segment 구조
```

### 새 코드 어디에 두나

- **명사(것)** → `entities/` (예: `entities/report`, `entities/store`)
- **동사(행동)** → `features/` — 단, 여러 페이지에서 재사용될 때만 (과도한 feature 금지)
- **큰 조합 블록** → `widgets/` · **화면** → `pages/` · **도메인 없는 재사용** → `shared/`

### 슬라이스 규칙

- 슬라이스마다 **`index.ts` 공개 API만 노출** (내부는 캡슐화, 외부는 `@/entities/foo`로 import)
- 세그먼트: `ui/`(컴포넌트) `model/`(상태·로직·데이터) `api/` `lib/`
- **test·story는 컴포넌트 옆에 colocation** (`ui/Foo.tsx` + `Foo.test.tsx` + `Foo.stories.tsx`)
- 엔티티끼리 참조는 `entities/<x>/@x/<y>.ts` public API로

## 디자인 시스템

- **토큰**: `src/app/index.css`의 `@theme` (색상·타이포 `text-*`·radius·shadow·gradient). Figma 변수 → 수동 미러링.
- **색상**: hex 유지 (디자이너가 hex로 줌 → 대조 쉬움). 그라데이션만 `in oklch` 보간.
- **폰트**: Pretendard Variable (CDN, `index.html`), 자간 `-0.02em`(-2%)
- **아이콘**: coolicons via `unplugin-icons` → `import Icon from '~icons/ci/<name>'`. `currentColor`라 `text-*`로 색 제어. **브랜드 로고만** 로컬 SVG.
- **컴포넌트**: `tailwind-variants`(`tv`) 패턴 (shadcn 스타일). 스토리는 모바일 뷰포트 기본.

## 명령어

- `pnpm dev` · `pnpm build` · `pnpm test:run` · `pnpm storybook` · `pnpm build-storybook`
- `pnpm lint`(oxlint) · `pnpm typecheck` · `pnpm format`
- 커밋 전 husky(lint-staged)가 자동 실행. 커밋 메시지 컨벤션: `[type] 제목` (commitlint).

## 워크플로우

- 브랜치: `feature` → PR → **`dev`** → PR → **`main`**(프로덕션)
- Vercel 프로젝트 2개: **앱**(`pnpm build`→`dist`) / **Storybook**(`pnpm build-storybook`→`storybook-static`)
- 이슈 → 브랜치 → 커밋 → PR (`Closes #N`)
