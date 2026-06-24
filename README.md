# butilkka-fe

Vite + React + TypeScript + Tailwind CSS v4 기반 프론트엔드 프로젝트.

## Tech Stack

| 영역          | 사용 기술                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| 빌드 도구     | [Vite](https://vite.dev) 8                                                                            |
| 프레임워크    | [React](https://react.dev) 19                                                                         |
| 언어          | [TypeScript](https://www.typescriptlang.org) 6                                                        |
| 스타일링      | [Tailwind CSS](https://tailwindcss.com) v4 (`@tailwindcss/vite`)                                      |
| 린터          | [oxlint](https://oxc.rs)                                                                              |
| 포매터        | [Prettier](https://prettier.io)                                                                       |
| Git 훅        | [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) |
| 패키지 매니저 | [pnpm](https://pnpm.io)                                                                               |

## 시작하기

```bash
# pnpm 사용 (corepack 권장)
corepack enable

# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:5173)
pnpm dev
```

> 이 프로젝트는 pnpm으로 통일합니다. `package.json`의 `packageManager` 필드로 버전이 고정되어 있어 corepack이 자동으로 맞춰줍니다.

## 스크립트

| 명령어              | 설명                                 |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | 개발 서버 (HMR)                      |
| `pnpm build`        | 타입 체크(`tsc -b`) 후 프로덕션 빌드 |
| `pnpm preview`      | 빌드 결과물 로컬 미리보기            |
| `pnpm lint`         | oxlint 실행                          |
| `pnpm lint:fix`     | oxlint 자동 수정                     |
| `pnpm format`       | Prettier로 전체 포맷 적용            |
| `pnpm format:check` | 포맷 검사만 (CI용)                   |

## 컨벤션

- **경로 별칭**: `@/`는 `src/`를 가리킵니다. 예) `import { Foo } from '@/components/Foo'`
- **커밋 전 자동 검사**: Husky `pre-commit` 훅이 스테이징된 파일에 `oxlint --fix` → `prettier --write`를 실행합니다 (lint-staged).
- **포맷 규칙**: 세미콜론 없음, 작은따옴표, 행 너비 100 (`.prettierrc.json`, `.editorconfig`).
- **Tailwind 클래스 정렬**: `prettier-plugin-tailwindcss`가 `className` 순서를 자동 정렬합니다. 저장/커밋 시 재정렬되니 순서는 신경 쓰지 마세요.

### 커밋 메시지

`[type] 설명` 형식. `commit-msg` 훅(commitlint)이 자동 검사하며, 형식이 틀리면 커밋이 막힙니다.

| type         | 용도                                 |
| ------------ | ------------------------------------ |
| `[feat]`     | 새로운 기능 추가                     |
| `[fix]`      | 버그 수정                            |
| `[docs]`     | 문서 수정                            |
| `[test]`     | 테스트 코드 추가                     |
| `[refactor]` | 코드 리팩토링                        |
| `[style]`    | 코드 의미에 영향 없는 변경 (포맷 등) |
| `[chore]`    | 빌드/패키지 매니저 수정              |

- 예시: `[feat] 온보딩 3필드 입력 폼 구현`
- 설명은 **한글 + 명령형**("추가"/"수정"), **한 커밋 = 한 가지 일**

## 🌿 브랜치 전략

- `main` : 배포·시연용. 안정된 버전만. **직접 push 금지** (PR로만 반영)
- `dev` : 통합 브랜치. 기능들이 모이는 곳
- 작업 브랜치 : `dev`에서 따서 작업, 성격에 따라 prefix 구분

**prefix** (커밋 type과 동일)

| prefix      | 용도                |
| ----------- | ------------------- |
| `feat/`     | 새로운 기능         |
| `fix/`      | 버그 수정           |
| `refactor/` | 리팩토링            |
| `style/`    | 스타일·포맷 변경    |
| `docs/`     | 문서                |
| `chore/`    | 설정·패키지 등 잡일 |
| `test/`     | 테스트 코드         |

**네이밍**: `prefix/작업내용` (소문자, 단어 구분은 하이픈)
예) `feat/onboarding`, `fix/dashboard-layout`, `refactor/map-wrapper`, `chore/eslint-setup`

**흐름**

```text
dev 에서 작업 브랜치 따기 (feat/, fix/ …)
  → 작업 → 커밋
  → PR (작업 브랜치 → dev)
  → 리뷰 → dev 머지
  → 안정화되면  dev → main
```

## 프로젝트 구조

```text
src/
  App.tsx        # 루트 컴포넌트
  main.tsx       # 진입점
  index.css      # Tailwind 진입 (@import 'tailwindcss')
  assets/        # 정적 에셋
```

## 참고 (선택 사항)

> 지금 당장 할 필요 없는 **선택** 안내입니다.

기본 oxlint는 문법 수준 검사만 합니다. 더 깊은 **타입 인지(type-aware)** 검사를 원하면 `oxlint-tsgolint`를 설치하고 `.oxlintrc.json`에 `"options": { "typeAware": true }`를 추가하세요. ([oxlint 규칙 문서](https://oxc.rs/docs/guide/usage/linter/rules))
