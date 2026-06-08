-- personality-plus 기존 응답(1~4)을 신규 부호 척도(-2,-1,+1,+2)로 변환합니다.
-- 매핑: 1 -> -2, 2 -> -1, 3 -> +1, 4 -> +2
--
-- 사용 방법:
-- 1) Supabase SQL Editor에서 이 파일 전체를 실행합니다.
-- 2) 트랜잭션 내부에서 사전검증 -> 백업 -> 변환 -> 사후검증 순서로 진행됩니다.
--
-- 주의:
-- - 본 스크립트는 test_slug='personality-plus' 데이터만 수정합니다.
-- - answers가 JSON object인 행만 대상으로 합니다.

begin;

-- 0) 사전검증: 현재 분포 확인 (1~4 이외 값이 없는지 점검)
with before_values as (
  select (e.value)::int as score
  from client_assessments ca
  cross join lateral jsonb_each_text(ca.result_data -> 'answers') e
  where ca.test_slug = 'personality-plus'
    and jsonb_typeof(ca.result_data -> 'answers') = 'object'
)
select score, count(*) as count
from before_values
group by score
order by score;

-- 1) 백업 테이블 생성(최초 1회)
create table if not exists client_assessments_personality_plus_backup_20260604 as
select *
from client_assessments
where test_slug = 'personality-plus';

-- 2) 1~4 -> -2,-1,+1,+2 변환
update client_assessments ca
set result_data = jsonb_set(
  ca.result_data,
  '{answers}',
  (
    select jsonb_object_agg(
      e.key,
      to_jsonb(
        case (e.value)::int
          when 1 then -2
          when 2 then -1
          when 3 then 1
          when 4 then 2
          else (e.value)::int
        end
      )
    )
    from jsonb_each_text(ca.result_data -> 'answers') e
  ),
  true
)
where ca.test_slug = 'personality-plus'
  and jsonb_typeof(ca.result_data -> 'answers') = 'object';

-- 3) 사후검증: 변환 이후 분포 확인
with after_values as (
  select (e.value)::int as score
  from client_assessments ca
  cross join lateral jsonb_each_text(ca.result_data -> 'answers') e
  where ca.test_slug = 'personality-plus'
    and jsonb_typeof(ca.result_data -> 'answers') = 'object'
)
select score, count(*) as count
from after_values
group by score
order by score;

commit;
