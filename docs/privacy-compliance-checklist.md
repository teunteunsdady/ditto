# 개인정보 컴플라이언스 체크리스트

이 문서는 현재 프로젝트 기준으로 개인정보 수집/이용/보관/파기 프로세스를 점검하기 위한 운영 체크리스트입니다.

> 주의: 본 문서는 법률 자문이 아니며, 최종 준수 판단은 법무/노무/컴플라이언스 검토를 통해 확정하세요.

## 1) 수집 단계(화면/동의) 체크

- [ ] 필수/선택 항목을 명확히 구분했는가
  - 현재 대상자 등록 화면(`src/components/admin/new-client-details-form.tsx`)은 이름/생년월일/휴대번호/스트레스요인/사는곳(동) + 동의 체크를 필수 처리
- [ ] 동의 문구에 아래 4가지가 포함되어 있는가
  - 수집 항목
  - 이용 목적
  - 보유/이용 기간
  - 동의 거부권 및 불이익
- [ ] 동의 문구와 개인정보처리방침의 내용이 일치하는가
  - 현재 방침(`src/app/privacy-policy/page.tsx`)은 문의 중심 항목 기준이므로, 대상자 등록 항목(생년월일/휴대번호/스트레스요인/거주동) 반영 필요
- [ ] 동의 시점 기록이 저장되는가
  - `clients.privacy_consent`, `clients.privacy_consented_at` 사용

## 2) 저장 단계(DB/암호화) 체크

- [ ] 휴대번호가 평문이 아닌 암호문으로 저장되는가
  - 서버 암호화 유틸: `src/lib/security/field-encryption.ts`
  - 저장 API: `src/app/api/clients/route.ts`
- [ ] 암호화 키가 안전하게 분리 관리되는가
  - 환경변수: `CLIENT_PHONE_ENCRYPTION_KEY`
  - `.env.local`, 배포 시크릿에만 저장 (레포 커밋 금지)
- [ ] DB 제약 조건이 적용되어 있는가
  - 마이그레이션: `docs/sql/005_add_client_phone_and_privacy_consent.sql`
  - 체크 제약: `phone like 'enc:v1:%'` (값이 있을 때)
- [ ] 운영 DB에 컬럼 반영이 완료되었는가
  - `phone`, `privacy_consent`, `privacy_consented_at`

## 3) 접근 통제/운영 단계 체크

- [ ] 대상자 개인정보 조회/수정 권한이 관리자에게만 제한되는가
  - 인증: 관리자 세션 기반
  - DB 접근: service role 경로 + RLS 정책 유지
- [ ] 내부 계정 최소권한 원칙이 적용되는가
  - 운영자 계정 공유 금지, 개인 계정 사용 권장
- [ ] 개인정보 조회/수정/삭제 이벤트 로그가 남는가
  - 최소 항목: 수행자, 시각, 대상자 ID, 작업 유형
- [ ] 개발/운영 환경 분리가 되어 있는가
  - 실데이터를 로컬/스테이징에 복제하지 않기

## 4) 보유/파기 단계 체크

- [ ] 개인정보 보유 기간이 정의되어 있는가
  - 현재 운영 기준: 수집일(등록일)로부터 최대 1년
- [ ] 파기 배치(자동화) 또는 수동 SOP가 존재하는가
- [ ] 파기 이력(누가/언제/무엇을) 기록이 남는가
- [ ] 백업 데이터의 보관 기간/파기 정책도 정의되어 있는가

## 5) 정보주체 권리 대응 체크

- [ ] 열람/정정/삭제/처리정지 요청 접수 채널이 있는가
- [ ] 요청자 본인확인 절차가 있는가
- [ ] 법정 처리기한 내 처리 프로세스가 있는가
- [ ] 처리 결과 회신 템플릿(이메일/문자)이 준비되어 있는가

## 6) 대외 문서/고지 체크

- [ ] 개인정보처리방침에 실제 수집 항목이 최신 반영되어 있는가
- [ ] 수탁사/인프라 제공자(예: Supabase) 고지가 있는가
- [ ] 개인정보 보호책임자 정보가 실제 값으로 기입되어 있는가
  - 현재 방침에는 `[입력 필요]` 항목 존재
- [ ] 방침 시행일/개정일이 갱신되어 있는가

## 7) 사고 대응 체크

- [ ] 유출 의심 시 대응 플로우(탐지-격리-분석-통지)가 있는가
- [ ] 암호화 키 교체(runbook) 절차가 있는가
- [ ] 신고/통지 채널(내부/외부 기관)이 문서화되어 있는가
- [ ] 정기 보안 점검이 수행되는가
  - 참고: `docs/security-hardening.md`, `npm run security:smoke`

## 8) 지금 당장 권장 액션(우선순위)

1. 개인정보처리방침(`src/app/privacy-policy/page.tsx`)을 대상자 등록 기준으로 최신화
2. 운영 DB에 `docs/sql/005_add_client_phone_and_privacy_consent.sql` 적용 여부 재검증
3. `CLIENT_PHONE_ENCRYPTION_KEY` 운영 시크릿 등록 및 권한 최소화
4. 개인정보 보호책임자 정보 입력 및 권리행사 접수 채널 확정
5. 1년 보관 정책 기준 파기 SOP 문서화(담당자/주기/증적 방식 포함)

## 9) 운영 확인용 빠른 쿼리

```sql
select
  count(*) as total_clients,
  count(*) filter (where phone is null) as phone_null_count,
  count(*) filter (where phone is not null and phone not like 'enc:v1:%') as phone_non_encrypted_count,
  count(*) filter (where privacy_consent is true and privacy_consented_at is null) as consent_without_timestamp_count
from public.clients;
```
