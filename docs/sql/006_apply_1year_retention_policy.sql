-- 개인정보 1년 보관 정책 적용 SQL
-- 대상: inquiries, clients
-- 실행 위치: Supabase SQL Editor
--
-- 정책:
-- - inquiries: created_at 기준 1년 초과 데이터 삭제
-- - clients: created_at 기준 1년 초과 데이터 삭제
--   (client_assessments는 FK on delete cascade로 함께 삭제)

begin;

-- 0) 삭제 대상 건수 사전 확인
-- 필요 시 먼저 아래 SELECT만 단독 실행하여 영향 범위를 확인하세요.
-- select count(*) from public.inquiries where created_at < now() - interval '1 year';
-- select count(*) from public.clients where created_at < now() - interval '1 year';

-- 1) 문의 데이터 1년 초과분 삭제
delete from public.inquiries
where created_at < now() - interval '1 year';

-- 2) 대상자 데이터 1년 초과분 삭제
delete from public.clients
where created_at < now() - interval '1 year';

commit;

-- 3) 실행 후 검증
select
  (select count(*) from public.inquiries where created_at < now() - interval '1 year') as inquiries_over_1y,
  (select count(*) from public.clients where created_at < now() - interval '1 year') as clients_over_1y;

-- 운영 권장:
-- - 매월 1회 이상 정기 실행(수동 또는 스케줄링)
-- - 삭제 전 row count를 점검하고, 삭제 후 로그/증적을 남기세요.
