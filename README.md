<p align="center">
  <img src="public/og-image.png" alt="버틸까 — 상권 쇠퇴, 미리 버틸지 판단하세요" width="720" />
</p>

# 버틸까 (butilkka)

> **상권 쇠퇴, 미리 버틸지 판단하세요.** 유동인구·공실·폐업률로 내 가게 상권 등급을 진단하는 모바일 웹앱

가게가 어려워지는 신호는 매출보다 상권에 먼저 나타납니다. 버틸까는 서울 자치구 상권의 쇠퇴 신호를 분석해 **등급과 리포트로 알려주는** 서비스입니다. 사장님은 지도에서 우리 동네 상권을 확인하고, 리포트로 "버틸지, 옮길지"를 판단할 수 있습니다. (신한 해커톤 출품작)

**라이브 데모**: [butilkka.site](https://butilkka.site) — 모바일 최적화라 폰으로 여는 걸 권장합니다. 홈 화면 설치(PWA)도 지원해요.

<!-- Storybook 배포: [storybook.butilkka.site](URL 채우기) -->

## 스크린샷

<!-- docs/screenshots/ 에 추가 후 주석 해제
| 지도 홈 | 리포트 | PDF 저장 |
| --- | --- | --- |
| ![지도 홈](docs/screenshots/map.png) | ![리포트](docs/screenshots/report.png) | ![PDF](docs/screenshots/pdf.png) |
-->

## 핵심 기능

- **지도 상권 탐색** — 서울 자치구별 쇠퇴 등급을 지도에서 한눈에. 업종 카테고리·지표별로 갈아 끼워 보기
- **홈 대시보드** — 내 가게 상권의 등급·핵심 지표 요약
- **상권 리포트** — 쇠퇴 원인·선행 신호·예측 트렌드에 AI 추천과 대안 상권, 유사 상권 사례까지
- **리포트 PDF 저장** — 리포트를 A4 PDF로 다운로드 (카드 경계 기준 페이지 분할)
- **카카오 로그인 + 온보딩** — 가게 위치·업종 3필드 입력이면 시작
- **관심 지역·알림·구독** — 관심 상권 즐겨찾기, 변화 알림, 리포트 구독
- **설치형 PWA** — 홈 화면 설치 시트, 오프라인 셸 선캐시

## 기술 하이라이트

React 19 · Vite · TypeScript · Tailwind CSS v4 · TanStack Query · Zustand · MSW · Vitest + Storybook

- **Feature-Sliced Design** — `pages/widgets/features/entities/shared` 레이어드 아키텍처, 슬라이스별 공개 API로 의존 방향 강제
- **성능** — 첫 로드 JS **243.3KB → 92.9KB gzip (−62%)**, PWA 프리캐시 **−68%**, 바텀시트 드래그 스크립팅 **−85%**, 주요 화면 idle 사전 로드. 전후 실측 수치와 과정은 [docs/performance-optimization.md](docs/performance-optimization.md)
- **품질** — CI에서 lint·typecheck·테스트(Storybook 브라우저 테스트 포함)·빌드 검증, 성능 예산 검사 스크립트(`pnpm performance:check`)로 회귀 방지

## 시작하기

```bash
corepack enable   # packageManager 필드 기준으로 pnpm 버전 자동 고정
pnpm install
pnpm dev          # http://localhost:5173
```

백엔드 없이 전체 플로우를 체험하려면 `.env`에 `VITE_ENABLE_MSW=true`를 넣으면 MSW 목 데이터로 동작합니다.
