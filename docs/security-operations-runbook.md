# 보안 운영 Runbook

이 문서는 CoreGround 서비스(Vercel 운영 기준)의 보안 설정을 운영 반영할 때 따라야 할 최소 절차를 정리합니다.

## 0) Vercel 운영 기준

- 환경변수 설정 위치: `Vercel Project > Settings > Environment Variables`
- 기본 환경 구분:
  - `Production`: 실제 운영 도메인
  - `Preview`: PR/브랜치 미리보기
  - `Development`: 로컬 개발 연동 시 사용
- 원칙:
  - `NEXT_PUBLIC_*`만 브라우저 노출 가능
  - `SUPABASE_SERVICE_ROLE_KEY`, `MASTER_*`, `TURNSTILE_SECRET_KEY`는 서버 비밀값
- 환경변수 변경 후에는 **재배포**하여 반영 상태를 확인합니다.

## 1) 배포 전 필수 체크

- `MASTER_SESSION_SECRET`가 강한 랜덤값으로 설정되어 있는지 확인
- `SUPABASE_SERVICE_ROLE_KEY`가 서버 환경변수에만 존재하는지 확인
- Vercel `Production` 환경에 아래 항목이 설정되어 있는지 확인
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `MASTER_LOGIN_EMAIL`
  - `MASTER_LOGIN_PASSWORD`
  - `MASTER_SESSION_SECRET`
- 필요 시 `Preview`에도 동일 또는 분리된 안전 값 적용

## 2) 문의 데이터 RLS 강제 전환

1. Supabase SQL Editor에서 `docs/inquiries-rls-hardening.sql` 실행
2. 문의 폼 실사용 테스트(정상 저장 확인)
3. Vercel `Production` 환경변수에 `INQUIRIES_DISABLE_SERVICE_FALLBACK=true` 설정
4. Vercel 재배포 후 문의 폼 재검증

## 3) 로그인 보안 강화(권장)

- Turnstile 사용 시 환경변수 설정
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
- 설정 위치: Vercel `Production`(필요 시 `Preview`도)
- 설정 후 재배포하고 로그인 페이지에서 보안 위젯 표시 및 정상 로그인 여부 확인

## 4) 보안 이벤트 알림 연동(권장)

- `SECURITY_ALERT_WEBHOOK_URL` 설정 시 아래 이벤트를 외부로 수신 가능
  - `login.failed`
  - `login.locked`
  - `login.rate_limited`
  - `login.origin_blocked`
  - `login.success`
- 운영 초기에 알림 빈도를 관찰하고, 필요 시 수신 채널 필터링
- 설정 위치: Vercel `Production`

## 5) 점검 명령어

- 기본 보안 스모크 테스트:

```bash
npm run security:smoke
```

- 전체 보안 스모크 테스트(rate limit 소진 포함):

```bash
npm run security:smoke:full
```

- 코드/정적 점검:

```bash
npm run lint
```

## 6) 사고 대응 최소 절차

로그인 시도 급증, 비정상 요청 증가 등 이상 징후 발생 시:

1. 웹훅/서버 로그에서 이벤트 유형과 출처 확인
2. Vercel 환경변수에서 `MASTER_LOGIN_PASSWORD`, `MASTER_SESSION_SECRET` 즉시 교체
3. 필요 시 `SUPABASE_SERVICE_ROLE_KEY` 로테이션 후 Vercel 값도 교체
4. Supabase 접근 로그 및 쿼리 내역 점검
5. Vercel 재배포 후 로그인/문의/관리자 API 동작 재검증
6. 조치 내역/영향 범위 문서화

## 7) 정기 운영 권장사항

- 월 1회: `npm run security:smoke` 실행 및 결과 기록
- 분기 1회: 키 로테이션 리허설(시크릿 교체 절차 점검)
- 분기 1회: 문의 테이블 RLS 정책 재검토
