# Supabase 초기 세팅 가이드

## 1) 프로젝트 생성
1. [Supabase](https://supabase.com/) 로그인 후 `New project` 생성
2. 프로젝트 이름: 예) `incoaching-clone`
3. DB 비밀번호 저장 (분실 시 번거롭습니다)
4. Region은 한국과 가까운 곳(예: Northeast Asia) 선택

## 2) API 키 확인
Supabase 대시보드 `Project Settings > API`에서 아래 값 복사:
- `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

프로젝트 루트에 `.env.local` 생성:

```bash
cp .env.example .env.local
```

값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버(API Route)에서만 사용해야 하며
클라이언트 코드에 노출되면 안 됩니다.

## 3) 테이블 설계 (1차 권장)
초기에는 아래 2개 테이블로 시작하는 것을 권장합니다.

- `inquiries` (문의 저장)
  - `id` uuid pk
  - `name` text
  - `email` text
  - `company` text
  - `message` text
  - `created_at` timestamptz default now()

- `insights` (인사이트/뉴스레터 게시글)
  - `id` uuid pk
  - `title` text
  - `slug` text unique
  - `summary` text
  - `content` text
  - `published_at` timestamptz
  - `created_at` timestamptz default now()

### 코칭 운영용 스키마 (admin + clients)

요청하신 관리자/대상자 관리 테이블은 아래 SQL로 생성할 수 있습니다.

- 실행 파일: `docs/sql/001_init_admin_clients.sql`
- 포함 항목:
  - `admins` 테이블
  - `clients` 테이블
  - `created_at`, `updated_at`
  - `created_id`, `updated_id` (관리자 참조)
  - `updated_at` 자동 갱신 trigger
  - RLS 기본 잠금(서비스 롤 전용)

실행 방법:
1. Supabase 대시보드 > SQL Editor
2. `docs/sql/001_init_admin_clients.sql` 내용 전체 붙여넣기
3. Run 실행

이미 `001`을 먼저 실행한 경우(기존 환경):
1. SQL Editor에서 `docs/sql/002_add_soft_delete_to_clients.sql` 실행
2. `clients`에 소프트 삭제 컬럼(`deleted_at`, `deleted_id`)이 추가됩니다.

검사 결과 저장 기능을 쓰려면 아래도 실행해주세요:
1. SQL Editor에서 `docs/sql/003_add_client_test_results.sql` 실행
2. `client_assessments` 테이블이 생성되고, 대상자/검사별 결과가 저장됩니다.

상담 문의 폼 저장 기능을 쓰려면 아래도 실행해주세요:
1. SQL Editor에서 `docs/sql/004_add_inquiries.sql` 실행
2. `inquiries` 테이블이 생성되고, 문의 데이터가 저장됩니다.

## 3-1) 앱 연동 시 필요한 환경변수

관리자 전용 대상자 등록/조회 API를 사용할 때는 아래도 필요합니다.

- `SUPABASE_SERVICE_ROLE_KEY`
- `MASTER_LOGIN_EMAIL`
- `MASTER_LOGIN_PASSWORD`
- `MASTER_SESSION_SECRET` (권장, 세션 토큰 서명키)

## 4) RLS(Row Level Security) 권장 정책
- 기본: 테이블마다 RLS 활성화
- `insights`: 공개 조회만 허용 (`select` 정책)
- `inquiries`: 서버에서만 insert 하도록 설계 (클라이언트 직접 insert 제한)

## 5) 인증(Auth)
어드민 페이지를 만들 계획이면:
- `Authentication > Providers`에서 이메일 로그인 활성화
- 추후 `profiles` 테이블과 role 컬럼으로 관리자 구분
- `Authentication > URL Configuration`에서 아래 값 설정
  - Site URL: `http://localhost:3000`
  - Redirect URL: `http://localhost:3000/auth/callback`

## 6) 스토리지(Storage)
이미지/파일 업로드 필요 시:
- `Storage`에 `public-assets` 버킷 생성
- 공개 파일만 업로드할지/서명 URL 쓸지 정책 먼저 결정
