# 성능 최적화 정리

버틸까 FE의 성능 최적화 내역과 전/후 실측 수치.

**핵심 수치 요약**

- 첫 로드 JS **243.3KB → 92.9KB gzip (−62%)**
- PWA 프리캐시 **1,313KiB → 421KiB (−68%)**
- 바텀시트 드래그 스크립팅 **241ms → 36ms (−85%)**
- 탭 첫 전환·지도 첫 진입·첫 그래프·리포트 상세: **클릭 후 로드 → idle 사전 로드** (3차)

## 측정 기준 (4개 지점)

| 지점  | 기준                        | 설명                             |
| ----- | --------------------------- | -------------------------------- |
| **A** | `5b05e7a` (#46 지도홈 머지) | 성능 최적화 이전                 |
| **B** | `26fc647` (#49~#51 릴리스)  | 1차 최적화(번들·로딩) 반영       |
| **C** | 워킹트리 (2026-07-17)       | 2차 최적화(런타임 리렌더) 반영   |
| **D** | 워킹트리 (2026-07-19)       | 3차 최적화(프리페치·워터폴) 반영 |

A·B는 해당 커밋을 별도 git worktree로 체크아웃해 동일 환경에서 빌드·측정했다.

## 번들 · 로딩 수치 (프로덕션 빌드, gzip)

| 지표                         | A: 최적화 전                       | B: 1차 후                 | C: 2차 후                 | D: 3차 후  |
| ---------------------------- | ---------------------------------- | ------------------------- | ------------------------- | ---------- |
| 첫 로드 JS (index.html 기준) | **243.3KB**                        | **95.0KB**                | 95.0KB                    | **92.9KB** |
| dist 전체 JS (raw)           | 1,242KiB                           | 835KiB                    | 837KiB                    | 1,738KiB ¹ |
| PWA 프리캐시                 | **1,313KiB**                       | **418KiB**                | 418KiB                    | 421.4KiB ² |
| MSW 프로덕션 누출            | 있음 (`mockServiceWorker.js` 배포) | 없음                      | 없음                      | 없음       |
| canvas-confetti (10.6KB)     | —                                  | 페이지 청크와 함께 (정적) | **발사 시점 로드 (동적)** | 동적 유지  |

B→C에서 첫 로드가 동일한 것은 정상 — 2차는 번들이 아니라 런타임 최적화이기 때문.

¹ 증가분은 3차와 무관 — 리포트 PDF 스택(jspdf 390 + html2canvas 194 + jspdf deps 147 + snapdom 128 ≈ 859KiB, PR #56)으로, 전부 다운로드 버튼 시점 lazy 로드라 첫 로드·프리캐시엔 영향 없음.
² 모듈 그래프 변경으로 분리된 `react-*.js` 공유 청크를 앱 셸 선캐시에 추가한 만큼(+3.3KiB). 대신 엔트리는 95.0→92.9KB로 감소(같은 분리의 부수효과).

## 인터랙션 런타임 수치 (B vs C)

동일 시나리오 스크립트(Playwright + CDP `Performance.getMetrics`)로 JS 실행시간(ScriptDuration)을 비교.

| 시나리오                                | B: 릴리스            | C: 2차 후            | 변화        |
| --------------------------------------- | -------------------- | -------------------- | ----------- |
| 지도 검색 타이핑 27자 × 3회             | 394~443ms (평균 420) | 309~400ms (평균 351) | **약 −16%** |
| 바텀시트 드래그 3회 (pointermove 240회) | 241ms                | **36ms**             | **−85%**    |

- **드래그 −85%**: pointermove마다 setState → 매 프레임 리렌더하던 것을 DOM `transform` 직접 조작으로 전환한 효과.
- **타이핑 −16%**: `KakaoMap` memo로 키 입력마다 마커 25개 포털이 재조정되던 것을 차단. 데스크톱에선 절대값이 작아 일부 노이즈와 겹치지만 방향은 일관 — 저사양 모바일일수록 절대 격차가 커지는 성질.

## 1차 최적화 — 번들 · 로딩 (#49, 2026-07-16 릴리스)

- **전 페이지 라우트 단위 `React.lazy`** + Suspense(지연 스피너) + 청크 로드 실패 에러 바운더리 (`src/app/App.tsx`)
- **recharts 분리**: `TrendGraph`를 dynamic import — 94KB gzip 청크가 지도 상세 시트를 열 때만 로드 (`src/widgets/district-sheet/ui/DistrictSheet.tsx`)
- **MSW 프로덕션 3중 차단**: 조건부 dynamic import(`src/app/main.tsx`) + 빌드 후 워커 삭제 플러그인(`vite.config.ts`) + CI 누출 검사
- **PWA 프리캐시 최소화**: 앱 셸만 선캐시(418KiB), 라우트 청크·이미지·geojson은 CacheFirst 런타임 캐시 (`vite.config.ts`)
- **geojson 최적화**: 1.2MB `seoul.geojson` 제거 → 57.7KB `seoul-gu.geojson`을 fetch + react-query `staleTime: Infinity` 캐시 (`src/entities/district/model/useGuBoundaries.ts`)
- **성능 예산 CI**: 엔트리 gzip 180KB·프리캐시 500KB 예산 + MSW 누출 검사 자동화 (`scripts/check-performance.mjs`)

## 2차 최적화 — 런타임 리렌더 (2026-07-17)

### 핵심 4건

1. **`KakaoMap` + `LocationMarker`에 `React.memo`** — 검색 타이핑 한 글자마다 MapPage 리렌더 → 마커 25개 포털 재조정되던 것을 차단. props가 이미 전부 안정 참조(useMemo/useCallback)라 memo만으로 타이핑 중 지도 리렌더 0회.
   `src/widgets/district-map/ui/KakaoMap.tsx`, `src/shared/ui/LocationMarker/LocationMarker.tsx`
2. **카카오맵 SDK preconnect** — SDK가 런타임 동적 주입이라 지도 첫 진입 때 시작되던 커넥션 핸드셰이크를 미리 수립. classic script(비-CORS)라 `crossorigin` 없이.
   `index.html`
3. **바텀시트 드래그 리렌더 제거** — pointermove마다 `setDragY()` → 매 프레임 전체 리렌더하던 것을 ref로 DOM `transform` 직접 조작(RankingSheet 패턴)으로 전환. pointercancel 처리 보강.
   `src/shared/ui/BottomSheet/BottomSheet.tsx`, `src/widgets/district-sheet/ui/DistrictSheet.tsx`
4. **`useAppHeight` rAF 코얼레싱** — `visualViewport scroll` 등 프레임마다 연발되는 이벤트의 뷰포트 계산·스타일 쓰기를 프레임당 1회로 병합. iOS settle 폴링은 보존.
   `src/shared/lib/useAppHeight.ts`

### 마감 4건

5. **Intl 포맷터 싱글턴화** — 옵션 붙은 `toLocaleString`은 호출마다 포맷터 생성과 유사 비용. `Intl.NumberFormat` 싱글턴 2개로 지도·홈 모델의 인라인 호출 9곳 교체.
   `src/shared/lib/formatNumber.ts` (신설), `src/pages/map/model/*`, `src/pages/map/ui/RankingSheet.tsx`, `src/pages/home/model/useHomeDashboard.ts`
6. **TrendGraph 스케일 계산 메모이즈** — `getValueScale(data)`가 그래프 탭(activeIndex 변경)마다 재계산되던 것을 `useMemo(…, [data])`로.
   `src/shared/ui/TrendGraph/TrendGraph.tsx`
7. **온보딩 스텝 Zustand 셀렉터화** — 스토어 통째 구독(모든 set에 리렌더) 5곳을 개별 셀렉터로 전환, authStore와 관례 통일.
   `src/pages/onboarding/ui/steps/{Name,Founded,Industry,Address,Terms}Step.tsx`
8. **canvas-confetti 동적 로드** — 완료 페이지 2곳에서 발사 시점에 `import()`, 모션 최소화(`prefers-reduced-motion`) 사용자는 로드 자체를 생략.
   `src/pages/onboarding/ui/steps/CompleteStep.tsx`, `src/pages/subscription-complete/SubscriptionCompletePage.tsx`
9. **성능 예산 조이기** — 실측 대비 여유를 좁혀 회귀 조기 감지: 엔트리 180→120KB, 프리캐시 500→460KiB.
   `scripts/check-performance.mjs`

## 3차 최적화 — 프리페치 · 워터폴 제거 (2026-07-19)

발표 시연 기준(콜드 스타트 첫 화면·각 화면 첫 진입 체감)으로, "클릭 후 시작"하던 로드를 미리 당기는 추가형 변경. 재방문용 최적화(쿼리 캐시 영속화·web-vitals RUM·manualChunks)는 의도적으로 제외했다. 적용 전 코드베이스에 `prefetchQuery`·청크 프리페치는 0건이었다.

1. **콜드 스타트 워터폴 제거** — 앱 JS → 세션 확인 fetch(SessionGate 블로킹) → 홈 청크 → 대시보드 fetch **4단 직렬**이던 것을: 홈 청크는 부팅(모듈 평가) 즉시 킥오프해 세션 확인과 병렬로, 대시보드는 세션 확정 직후 `prefetchQuery`로 HomePage 마운트를 기다리지 않고 시작.
   `src/app/App.tsx`
2. **idle 전체 프리페치** — 첫 페인트 후 `requestIdleCallback`(Safari 미지원이라 setTimeout 폴백)으로 나머지 라우트 청크 전부(하단 탭 순서 우선)·카카오맵 SDK·`seoul-gu.geojson`(+센트로이드 계산)·recharts(TrendGraph)를 선로드. 전부 정적 리소스라 인증 무관 — 로그인 화면 대기 중에도 완료된다. 탭 첫 전환 스피너, 지도 첫 진입의 SDK 핸드셰이크·geojson 순차 로드, 첫 구 선택 시 그래프 지연이 사라진다. 라우트 썽크는 App의 `lazy()`와 공유해 어느 쪽이 먼저 호출돼도 한 번만 받는다.
   `src/app/prefetch.ts` (신설)
3. **리포트 목록 → 상세 prefetch** — 히스토리 행 클릭 시 navigate 직전에 상세 `prefetchQuery` 시작 → 데이터 fetch가 페이지 전환·청크 로드와 병렬로 진행돼 상세 스켈레톤 노출 최소화. 상세 훅과 쿼리키·queryFn이 동일해 그대로 캐시 히트.
   `src/pages/report-history/ReportHistoryPage.tsx`
4. **guGeometry 쿼리 옵션 공유** — `queryOptions()`로 추출해 훅과 프리페치가 같은 키·`staleTime: Infinity`를 공유.
   `src/entities/district/model/useGuBoundaries.ts`

### 함정 2건 (성능 예산 CI가 잡아줌)

- **prefetch 모듈에서 entities 배럴을 정적 import 금지** — `@/entities/district`를 정적 import하자 배럴의 UI 컴포넌트까지 엔트리에 딸려 들어가 95.0→104.8KB로 예산(120KB) 방향 악화 + 선캐시 초과. 프리페치 대상 의존성(SDK 로더·쿼리 옵션)은 idle 시점 **동적 import**로 로드해야 엔트리가 안 커진다.
- **Rollup 공유 청크 분리** — 모듈 그래프가 바뀌며 react가 `assets/react-*.js` 공유 청크로 분리돼 앱 셸 선캐시 globPatterns에서 빠짐 → `vite.config.ts`에 패턴 추가. 부수효과로 엔트리는 92.9KB로 감소.

### 검증

빌드 예산 통과(엔트리 92.9/120KB·선캐시 421.4/460KiB) + 실서버 dev에서 Playwright로 진입 5초 내 라우트 모듈·카카오 SDK·geojson·TrendGraph·`GET /api/v1/dashboard`(200)가 전부 선로드되는 것을 네트워크 로그로 확인.

## 측정 방법 · 한계

- **번들**: 각 지점 프로덕션 빌드 후 `dist/index.html`이 참조하는 JS/CSS의 gzip 합산(첫 로드), `sw.js` 프리캐시 목록 합산.
- **런타임**: dev 서버 + Playwright로 동일 시나리오(타이핑 27자×3회, 드래그 240 move×3회)를 실행하고 CDP `Performance.getMetrics`의 ScriptDuration 증가분을 비교. 워밍업 1회 후 측정.
- **한계**: 런타임 수치는 데스크톱 크롬 + dev 빌드 기준의 **상대 비교용** — 절대값은 실기기·프로덕션 빌드에서 다르다. preconnect 효과는 로컬(RTT≈0)에서 측정 불가.

## 남은 선택 과제 (미적용)

- `manualChunks`로 react/router/query vendor 청크 고정 (장기 캐시 히트율)
- `og-image.png`(151KB) WebP 전환, 미사용 스캐폴딩 SVG 정리, 오프스크린 이미지 `loading="lazy"`
- 즐겨찾기 토글 낙관적 업데이트 — `useFavorites`가 성공 후 invalidate 방식이라 실서버에선 하트 반응이 왕복만큼 지연 (알림 설정·대표 가게에 이미 쓰는 `onMutate` 패턴 확장)
- 쿼리 캐시 영속화(persistQueryClient)·web-vitals RUM — 재방문/운영 단계용
- ~~리포트 PDF 캡처 라이브러리 dynamic import~~ → PR #56에서 적용됨 (snapdom·jspdf·html2canvas 전부 다운로드 시점 lazy)
