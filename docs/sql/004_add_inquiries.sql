-- 상담 문의 저장 테이블

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  category text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;

drop policy if exists inquiries_service_role_all on public.inquiries;
create policy inquiries_service_role_all
on public.inquiries
for all
to public
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
