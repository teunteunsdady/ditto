-- clients 테이블: 휴대번호(암호문), 개인정보 동의 컬럼 추가
-- 목적:
-- 1) 기존 운영 DB에도 신규 API INSERT가 실패하지 않도록 컬럼 보강
-- 2) 휴대번호는 서버에서 암호화된 문자열(enc:v1:...)만 저장하도록 가이드
--
-- 실행 위치: Supabase SQL Editor

begin;

-- 1) 컬럼 추가 (idempotent)
alter table public.clients
add column if not exists phone text,
add column if not exists privacy_consent boolean,
add column if not exists privacy_consented_at timestamptz;

-- 2) 기본값/백필
alter table public.clients
alter column privacy_consent set default false;

update public.clients
set privacy_consent = false
where privacy_consent is null;

alter table public.clients
alter column privacy_consent set not null;

-- 3) 휴대번호 포맷 가드(암호문 접두어)
-- 기존 레거시 null 데이터는 허용하고,
-- 값이 있는 경우 enc:v1:로 시작하는지 확인합니다.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_phone_encrypted_format_chk'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
    add constraint clients_phone_encrypted_format_chk
    check (phone is null or phone like 'enc:v1:%');
  end if;
end $$;

-- 4) 운영 데이터 상태에 따라 NOT NULL 승격
-- 기존 데이터에 null이 있으면 승격을 건너뛰고 안내 메시지만 남깁니다.
do $$
declare
  v_null_count bigint;
begin
  select count(*) into v_null_count
  from public.clients
  where phone is null;

  if v_null_count = 0 then
    alter table public.clients
    alter column phone set not null;
    raise notice 'phone NOT NULL 적용 완료';
  else
    raise notice 'phone NULL 데이터 %건 존재: NOT NULL 적용 건너뜀', v_null_count;
  end if;
end $$;

commit;

-- 5) 검증 쿼리
select
  count(*) as total_clients,
  count(*) filter (where phone is null) as phone_null_count,
  count(*) filter (where phone is not null and phone not like 'enc:v1:%') as phone_non_encrypted_count,
  count(*) filter (where privacy_consent is true and privacy_consented_at is null) as consent_without_timestamp_count
from public.clients;

-- 참고:
-- - 신규 API는 phone을 AES-GCM 암호문(enc:v1:...)으로 저장합니다.
-- - 기존 평문 데이터가 있다면 별도 재암호화 배치 후 phone NOT NULL을 최종 강제하세요.
