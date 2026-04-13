-- Admin/Clients 초기 스키마
-- Supabase SQL Editor에서 그대로 실행 가능합니다.

create extension if not exists pgcrypto;

-- updated_at 자동 갱신 공용 함수
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  login_email text not null unique,
  name text not null,
  role text not null default 'operator' check (role in ('owner', 'manager', 'operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date not null,
  stress_factor text not null,
  location text not null,
  created_id uuid references public.admins(id) on delete set null,
  updated_id uuid references public.admins(id) on delete set null,
  deleted_id uuid references public.admins(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_name_idx on public.clients (name);
create index if not exists clients_created_at_idx on public.clients (created_at desc);
create index if not exists clients_created_id_idx on public.clients (created_id);

drop trigger if exists trg_admins_updated_at on public.admins;
create trigger trg_admins_updated_at
before update on public.admins
for each row
execute function public.set_updated_at();

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- RLS 정책: 우선 서버 전용 접근 기준으로 잠금
alter table public.admins enable row level security;
alter table public.clients enable row level security;

drop policy if exists admins_service_role_all on public.admins;
create policy admins_service_role_all
on public.admins
for all
to public
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists clients_service_role_all on public.clients;
create policy clients_service_role_all
on public.clients
for all
to public
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- 샘플 관리자 1건
insert into public.admins (login_email, name, role)
values ('nw@sj.com', '기본 관리자', 'owner')
on conflict (login_email) do nothing;
