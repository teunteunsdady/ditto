# 보안 하드닝 및 점검 가이드

이 문서는 현재 프로젝트에 적용된 보안 하드닝 항목과 점검 방법을 정리합니다.

## 1) 적용된 보안 하드닝

### 1-1. 로그인 API 보호
- 대상: `/api/auth/login`
- 적용 내용:
  - `Origin` 검증 추가 (동일 출처가 아니면 `403`)
  - Rate Limit 추가 (IP 기준 `10분 / 8회`)
  - 로그인 실패 누적 잠금 추가 (IP+이메일 기준 `5회` 실패 시 `15분` 잠금, `423`)
  - (옵션) Cloudflare Turnstile CAPTCHA 검증 지원
  - 실패/잠금/성공 이벤트 보안 로그 및 웹훅 알림 지원
- 기대 효과:
  - CSRF/교차 출처 요청 완화
  - 무차별 대입(브루트포스) 시도 완화
  - 비정상 로그인 패턴 탐지 강화

### 1-2. 문의 API 남용 방지
- 대상: `/api/inquiries`
- 적용 내용:
  - Rate Limit 추가 (IP 기준 `10분 / 12회`)
  - 서버에서 Supabase anon 키 경로로 저장 시도 (RLS 정책 기반)
  - RLS 전환 과정 호환을 위해 service key fallback 지원
- 기대 효과:
  - 스팸/봇 트래픽 완화
  - service role key 의존도 축소

### 1-3. 관리자 상태 변경 API 보호
- 대상:
  - `/api/auth/logout` (`POST`)
  - `/api/clients` (`POST`)
  - `/api/clients/[id]` (`PATCH`, `DELETE`)
  - `/api/clients/[id]/tests/[testSlug]` (`POST`, `DELETE`)
- 적용 내용:
  - `Origin` 검증 추가
- 기대 효과:
  - 쿠키 기반 인증 요청의 교차 출처 악용 위험 완화

### 1-4. 세션 서명 검증 강화
- 대상: `src/lib/auth/master-session.ts`
- 적용 내용:
  - 서명 비교를 `timingSafeEqual` 기반으로 강화
  - 운영 환경에서 `MASTER_SESSION_SECRET` 우선 사용
  - 개발 환경에서는 기존 fallback 동작 유지
- 기대 효과:
  - 서명 비교 하드닝
  - 운영 환경 시크릿 분리 권장 경로 확보

### 1-5. 공통 보안 헤더 적용
- 대상: `next.config.mjs`
- 적용 헤더:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - (운영 환경) `Strict-Transport-Security`
- 기대 효과:
  - 클릭재킹/콘텐츠 타입 스니핑/불필요 권한 노출 완화

## 2) 자동 점검 스크립트

### 2-1. 스크립트 위치
- `scripts/security-smoke.sh`

### 2-2. 실행 명령어
- 기본 점검(안전 모드):

```bash
npm run security:smoke
```

- 전체 점검(rate limit 소진 테스트 포함):

```bash
npm run security:smoke:full
```

### 2-3. 점검 항목
- 홈 응답 상태 코드(`200`)
- 보안 헤더 존재 여부
- 로그인 API의 Origin 차단(`403`)
- (full 모드) 로그인 보호 동작 (`423` 또는 `429`)
- (full 모드) 문의 Rate Limit 동작 (`13번째` 시도 `429`)

## 3) 운영 시 주의사항

- `full` 모드는 실제 Rate Limit 카운터를 소진합니다.
  - 테스트 직후 일정 시간 로그인/문의가 `429`를 반환할 수 있습니다.
- 운영 환경에서는 반드시 `MASTER_SESSION_SECRET`를 별도로 설정하세요.
- `Strict-Transport-Security`는 HTTPS 운영 환경에서만 의미가 있습니다.
- 문의 API를 anon-only로 강제하려면:
  - `INQUIRIES_DISABLE_SERVICE_FALLBACK=true`
  - 이 경우 `docs/inquiries-rls-hardening.sql` 적용이 선행되어야 합니다.
- CAPTCHA를 사용할 경우 아래 환경변수를 함께 설정하세요:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
- 보안 이벤트를 외부로 전달하려면 웹훅 URL을 설정하세요:
  - `SECURITY_ALERT_WEBHOOK_URL`

## 4) 조정 가능한 항목

- 로그인 제한: `10분 / 8회`
- 로그인 잠금: `5회 실패 시 15분 잠금`
- 문의 제한: `10분 / 12회`

트래픽 특성에 따라 위 수치는 완화/강화 가능합니다.

## 5) DB 정책 적용(SQL)

- 문의 테이블 RLS 하드닝 SQL:
  - `docs/inquiries-rls-hardening.sql`
- 권장 절차:
  1. 스테이징에 SQL 적용
  2. `npm run security:smoke` / 문의 폼 실사용 테스트
  3. 운영 반영
