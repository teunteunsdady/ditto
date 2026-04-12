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
```

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
