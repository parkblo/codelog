# CodeLog

<img width="1920" height="1080" alt="CodeLog 메인 이미지" src="https://github.com/user-attachments/assets/c7032e17-4cb7-41a0-9226-37819bf71a9b" />

코드 스니펫과 짧은 글을 함께 올리고, 코드 리뷰용 라인 댓글로 대화할 수 있는 개발자 커뮤니티입니다.

- 현재 서비스: [loghub.vercel.app](https://loghub.vercel.app/)
- 레거시 도메인: [codelog.vercel.app](https://codelog.vercel.app/) -> 현재 `loghub.vercel.app`로 리다이렉트됩니다.

## 서비스 개요

CodeLog는 피드, 코드 리뷰, 프로필, 검색을 하나의 흐름으로 묶은 개발자용 소셜 제품입니다. 사용자는 텍스트만 올릴 수도 있고, 코드 스니펫과 태그를 포함한 게시글을 작성한 뒤 리뷰 허용 여부를 켜서 라인 단위 피드백까지 받을 수 있습니다.

## 핵심 경험

- 홈 피드에서 최신 게시글을 무한 스크롤로 탐색하고, 로그인한 사용자는 바로 게시글 작성을 시작할 수 있습니다.
- 게시글은 본문, 코드 스니펫, 언어, 태그, 코드 리뷰 허용 여부를 함께 관리합니다.
- 코드 리뷰 피드에서는 리뷰 허용 게시글만 모아 보고, 코드 라인 범위를 기준으로 리뷰 댓글을 남길 수 있습니다.
- 검색과 탐색 화면에서 키워드 검색, 태그 탐색, 인기 태그 발견 흐름을 제공합니다.
- 프로필 화면에서 기여 그래프, 게시글/좋아요 탭, 팔로워/팔로잉 목록, 프로필 편집을 지원합니다.
- 인증은 GitHub OAuth와 이메일/비밀번호를 모두 지원하며, 북마크와 설정 같은 보호된 화면은 로그인 상태를 요구합니다.

## 라우트 개요

| 경로 | 역할 | 인증 |
| --- | --- | --- |
| `/` | 기본 진입점. `/home`으로 리다이렉트됩니다. | 불필요 |
| `/home` | 메인 피드, 새 게시글 작성, 게시글 무한 스크롤 | 불필요 |
| `/code-review` | 코드 리뷰 허용 게시글 전용 피드 | 불필요 |
| `/explore` | 인기 태그 탐색과 검색 진입 | 불필요 |
| `/search?q=...&tag=...` | 키워드 또는 태그 기준 검색 결과 | 불필요 |
| `/post/[postId]` | 게시글 상세, 일반 댓글, 라인 리뷰 댓글 | 불필요 |
| `/profile/[username]` | 공개 프로필, 기여 그래프, 팔로우, 게시글/좋아요 탭 | 불필요 |
| `/profile` | 로그인 사용자를 자신의 프로필 URL로 리다이렉트 | 필요 |
| `/bookmarks` | 저장한 게시글 목록 | 필요 |
| `/settings` | 계정 설정과 로그아웃 | 필요 |
| `/auth/callback` | GitHub OAuth 콜백 처리 | 불필요 |

## 기술 스택

| 영역 | 기술 | 용도 |
| --- | --- | --- |
| Framework | Next.js 16, React 19, TypeScript | App Router 기반 SSR/RSC와 타입 안정성 |
| UI | Tailwind CSS v4, Radix UI, shadcn/ui 스타일 컴포넌트 | 일관된 UI 시스템과 빠른 화면 구현 |
| Data/Auth | Supabase SSR, `@supabase/supabase-js` | 인증, 데이터베이스, 스토리지 연동 |
| Client State | TanStack Query | 클라이언트 측 캐시와 갱신 |
| Forms/Validation | React Hook Form, Zod | 인증, 게시글, 프로필, 댓글 입력 검증 |
| Analytics/Monitoring | PostHog, Sentry | 제품 이벤트 추적과 오류 관측 |
| Quality | Vitest, Testing Library, ESLint | 단위 테스트, UI 테스트, 정적 검사 |

## 아키텍처 개요

- 라우트 엔트리는 `app/`에 두고, 실제 페이지 조합은 `src/pages`에서 담당합니다.
- UI와 도메인 코드는 `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` 계층으로 분리합니다.
- 서버 진입점은 `src/**/api/*.action.ts`, 도메인 로직은 `src/**/api/*.service.ts`로 나눠 유지합니다.
- 데이터 접근은 `src/shared/lib/database`의 어댑터 계층을 통해 Supabase 구현에 연결됩니다.
- 전역 클라이언트 런타임은 `QueryClientProvider`, 인증 상태, PostHog, Sonner 토스트를 `app/providers`에서 조합합니다.
- 인증/SSR용 Supabase 유틸리티는 `src/shared/lib/supabase/` 아래에서 공통 관리합니다.

## 디렉토리 구조

<!-- readme-sync:structure:start -->
```text
codelog/
├── app/               # App Router route entries, layout, and metadata
├── pages/             # Guard directory so Next.js does not treat src/pages as Pages Router
├── public/            # Static assets served as-is
├── src/               # Application layers and shared code
│   ├── pages/             # Page-level compositions in the FSD Pages layer
│   ├── widgets/           # Composite UI sections
│   ├── features/          # User-facing flows and interactions
│   ├── entities/          # Domain models and API layers
│   ├── shared/            # Shared UI, libraries, styles, and types
│   └── proxy.ts           # Request proxy entrypoint
├── test/              # Vitest setup and Node-oriented tests
└── package.json       # NPM scripts and dependency manifest
```
<!-- readme-sync:structure:end -->

## 개발 시작하기

### 요구 사항

- Node.js 20.9.0 이상
- npm
- Supabase 프로젝트
- 선택 사항: Vercel CLI (`npm run env:pull` 사용 시)

### 설치

```bash
git clone https://github.com/parkblo/codelog.git
cd codelog
npm ci
```

### 환경 변수

앱 실행에 직접 필요한 값입니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 예 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 예 | Supabase 퍼블릭 anon key |

운영/관측 기능에 쓰이는 선택 값입니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | 아니오 | PostHog 프로젝트 키. 없으면 분석 기능을 비활성화합니다. |
| `NEXT_PUBLIC_POSTHOG_HOST` | 아니오 | PostHog API 호스트. 기본값은 `https://us.i.posthog.com`입니다. |
| `NEXT_PUBLIC_SENTRY_DSN` | 아니오 | Sentry DSN |
| `NEXT_PUBLIC_SENTRY_ENABLED` | 아니오 | Sentry 강제 on/off. 없으면 프로덕션 환경에서만 활성화됩니다. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | 아니오 | 트레이싱 샘플링 비율. 기본값 `0.2` |
| `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` | 아니오 | 세션 리플레이 샘플링 비율. 기본값 `0.01` |
| `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE` | 아니오 | 에러 발생 시 리플레이 샘플링 비율. 기본값 `1` |
| `SENTRY_AUTH_TOKEN` | 아니오 | 소스맵 업로드용 Sentry 인증 토큰 |
| `SENTRY_ORG` | 아니오 | Sentry organization slug |
| `SENTRY_PROJECT` | 아니오 | Sentry project slug |

예시:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_ENABLED=true
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.2
NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.05
NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1

SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org_slug
SENTRY_PROJECT=your_sentry_project_slug
```

Vercel 프로젝트와 연결돼 있다면 아래 명령으로 `.env.local`을 가져올 수 있습니다.

```bash
npm run env:pull
```

### 실행

```bash
npm run dev
```

### 스크립트

<!-- readme-sync:commands:start -->
| 스크립트 | 실제 명령 |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `eslint` |
| `npm run check:readme` | `node scripts/readme-sync.mjs check` |
| `npm run sync:readme` | `node scripts/readme-sync.mjs sync` |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` |
| `npm run env:pull` | `npx vercel env pull .env.local` |
| `npm run test:coverage` | `vitest run --coverage` |
<!-- readme-sync:commands:end -->

## 품질 및 자동화

- `npm run check:readme`는 README의 디렉토리 구조 블록과 스크립트 표가 실제 코드와 `package.json`에 맞는지 검사합니다.
- `npm run sync:readme`는 위 두 관리 블록을 현재 저장소 상태로 다시 생성합니다.
- `npm test`와 `npm run test:coverage`로 Vitest 기반 테스트를 실행합니다.
- `npm run lint`로 ESLint 검사를 실행합니다.
- `.github/workflows/validate-readme-sync.yml`은 PR 열림, 업데이트, `ready_for_review`, 본문 수정 시 README 정합성을 검사합니다.
- 현재 GitHub Actions는 `readme-sync` 검증과 Supabase 타입 갱신만 관리하며, `lint`나 `test`를 자동 실행하는 워크플로는 아직 없습니다.
- `.github/workflows/refresh-supabase-types.yml`은 매일 08:00 KST에 Supabase 타입을 갱신하는 PR을 생성하며, `SUPABASE_ACCESS_TOKEN`과 `SUPABASE_PROJECT_REF` GitHub secrets가 필요합니다.
- 데이터베이스 마이그레이션은 `supabase/migrations/`에 두고, 생성된 타입은 `src/shared/types/database.types.ts`에 반영합니다.

## 라이선스

이 프로젝트는 **CC BY-NC 4.0** 라이선스를 따릅니다.

- 저작자 표시 없이 사용·수정·배포할 수 없습니다.
- 저작권자의 사전 허락 없이 상업적으로 사용할 수 없습니다.

자세한 내용은 [LICENSE](./LICENSE)를 확인하세요.
