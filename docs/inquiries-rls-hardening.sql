-- inquiries 테이블 RLS 하드닝 가이드
-- 적용 전: 백업/스테이징 테스트 권장

-- 1) RLS 활성화
alter table if exists public.inquiries enable row level security;

-- 2) 기존 policy 정리(중복 방지)
drop policy if exists "inquiries_anon_insert" on public.inquiries;
drop policy if exists "inquiries_authenticated_insert" on public.inquiries;
drop policy if exists "inquiries_no_select" on public.inquiries;
drop policy if exists "inquiries_no_update" on public.inquiries;
drop policy if exists "inquiries_no_delete" on public.inquiries;

-- 3) 익명/인증 사용자 insert만 허용
create policy "inquiries_anon_insert"
on public.inquiries
for insert
to anon
with check (true);

create policy "inquiries_authenticated_insert"
on public.inquiries
for insert
to authenticated
with check (true);

-- 4) 읽기/수정/삭제는 전부 차단
create policy "inquiries_no_select"
on public.inquiries
for select
to anon, authenticated
using (false);

create policy "inquiries_no_update"
on public.inquiries
for update
to anon, authenticated
using (false)
with check (false);

create policy "inquiries_no_delete"
on public.inquiries
for delete
to anon, authenticated
using (false);

-- 참고:
-- service_role은 RLS를 우회할 수 있으므로, service key 보관/권한 관리가 핵심입니다.
