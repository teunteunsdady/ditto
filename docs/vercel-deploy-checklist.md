# Vercel 배포 체크리스트

## 1) GitHub 푸시
1. 로컬 변경사항 커밋
2. GitHub 원격 저장소에 푸시

## 2) Vercel 프로젝트 생성
1. [Vercel](https://vercel.com/) 로그인
2. `Add New... > Project` 선택
3. GitHub 저장소 연결 후 Import

## 3) Environment Variables 등록
Vercel `Project Settings > Environment Variables`에 아래 값을 등록합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MASTER_LOGIN_EMAIL`
- `MASTER_LOGIN_PASSWORD`
- `MASTER_SESSION_SECRET` (권장)

환경별(Production/Preview/Development)로 동일하게 넣는 것을 권장합니다.

## 4) Supabase Auth URL 설정
Supabase 대시보드에서 아래 URL을 등록합니다.

- `Authentication > URL Configuration`
  - `Site URL`: `https://<your-vercel-domain>.vercel.app`
  - `Redirect URLs`: `https://<your-vercel-domain>.vercel.app/auth/callback`

## 5) 배포 확인
1. Vercel 배포 완료 후 도메인 접속
2. `/login`에서 마스터 계정 로그인 테스트
3. `운영 대시보드` 메뉴 노출 및 페이지 접근 확인
4. 모바일에서도 섹션 스크롤/터치 이동 동작 확인

## 6) 배포 후 권장 점검
- 마스터 비밀번호 주기적 변경
- 운영자 계정 하드코딩 금지(현재는 환경변수로 전환 완료)
- 필요 시 Vercel 프로젝트 도메인 커스텀 도메인으로 변경
