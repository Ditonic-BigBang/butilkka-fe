# 성능 최적화 정리

버틸까 FE의 성능 최적화 내역과 전/후 실측 수치.

**핵심 수치 요약**

- 첫 로드 JS **243.3KB → 95.0KB gzip (−61%)**
- PWA 프리캐시 **1,313KiB → 418KiB (−68%)**
- 바텀시트 드래그 스크립팅 **241ms → 36ms (−85%)**

## 측정 기준 (3개 지점)

| 지점  | 기준                        | 설명                           |
| ----- | --------------------------- | ------------------------------ |
| **A** | `5b05e7a` (#46 지도홈 머지) | 성능 최적화 이전               |
| **B** | `26fc647` (#49~#51 릴리스)  | 1차 최적화(번들·로딩) 반영     |
| **C** | 워킹트리 (2026-07-17)       | 2차 최적화(런타임 리렌더) 반영 |

A·B는 해당 커밋을 별도 git worktree로 체크아웃해 동일 환경에서 빌드·측정했다.

## 번들 · 로딩 수치 (프로덕션 빌드, gzip)

| 지표                         | A: 최적화 전                       | B: 1차 후                 | C: 2차 후                 |
| ---------------------------- | ---------------------------------- | ------------------------- | ------------------------- |
| 첫 로드 JS (index.html 기준) | **243.3KB**                        | **95.0KB**                | 95.0KB                    |
| dist 전체 JS (raw)           | 1,242KiB                           | 835KiB                    | 837KiB                    |
| PWA 프리캐시                 | **1,313KiB**                       | **418KiB**                | 418KiB                    |
| MSW 프로덕션 누출            | 있음 (`mockServiceWorker.js` 배포) | 없음                      | 없음                      |
| canvas-confetti (10.6KB)     | —                                  | 페이지 청크와 함께 (정적) | **발사 시점 로드 (동적)** |

B→C에서 첫 로드가 동일한 것은 정상 — 2차는 번들이 아니라 런타임 최적화이기 때문.

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

## 측정 방법 · 한계

- **번들**: 각 지점 프로덕션 빌드 후 `dist/index.html`이 참조하는 JS/CSS의 gzip 합산(첫 로드), `sw.js` 프리캐시 목록 합산.
- **런타임**: dev 서버 + Playwright로 동일 시나리오(타이핑 27자×3회, 드래그 240 move×3회)를 실행하고 CDP `Performance.getMetrics`의 ScriptDuration 증가분을 비교. 워밍업 1회 후 측정.
- **한계**: 런타임 수치는 데스크톱 크롬 + dev 빌드 기준의 **상대 비교용** — 절대값은 실기기·프로덕션 빌드에서 다르다. preconnect 효과는 로컬(RTT≈0)에서 측정 불가.

## 남은 선택 과제 (미적용)

- `manualChunks`로 react/router/query vendor 청크 고정 (장기 캐시 히트율)
- `og-image.png`(151KB) WebP 전환, 미사용 스캐폴딩 SVG 정리, 오프스크린 이미지 `loading="lazy"`
- 리포트 PDF 다운로드 도입 시 캡처 라이브러리는 반드시 dynamic import
