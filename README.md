# ditto's templates Start

1인 개발/무료 운영을 목표로 한 `Next.js + Supabase` 기반 홈페이지 스타터입니다.

## Getting Started

```bash
npm install
cp .env.example .env.local
```

`.env.local`에 Supabase 값을 넣은 뒤 실행:

```bash
npm run dev
```

필수 환경변수:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MASTER_LOGIN_EMAIL=...
MASTER_LOGIN_PASSWORD=...
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 기술 스택

- Frontend: Next.js(App Router) + React + TailwindCSS
- Backend: Supabase(PostgreSQL, Auth, Storage, Edge Functions)
- Deploy: Vercel + Supabase Free Tier

## 백엔드 추천 아키텍처

현재 조건(1인 개발, 무료 운영, 빠른 MVP)에서는 **별도 백엔드 서버를 두지 않는 구조**가 가장 효율적입니다.

- 데이터베이스/인증/스토리지: Supabase
- 서버 로직: Next.js Route Handlers 또는 Server Actions
- 필요한 경우 비동기/스케줄 로직: Supabase Edge Functions

이 구조는 운영 단순성, 비용, 개발 속도 모두에서 유리합니다.

## Supabase 세팅 문서

- `docs/supabase-setup.md`: Supabase 프로젝트 생성/키 설정/RLS 가이드
- `docs/vercel-deploy-checklist.md`: Vercel 배포 절차 체크리스트
- `docs/worklog.md`: 작업일지

## 현재 포함된 구조

- `src/lib/supabase/client.ts`: 브라우저용 Supabase 클라이언트
- `src/lib/supabase/server.ts`: 서버 컴포넌트/핸들러용 클라이언트
- `src/lib/supabase/middleware.ts` + `middleware.ts`: 세션 동기화

## 다음 단계 제안

1. 메인 섹션 UI 고도화
2. 문의 폼 + DB 저장 API 구현
3. 인사이트 게시글 CRUD 구현
4. 어드민 인증 및 권한 분리(RLS 정책)
