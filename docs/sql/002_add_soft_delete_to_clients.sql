-- 기존 clients 테이블을 소프트 삭제 대응으로 확장
-- 001_init_admin_clients.sql를 이미 실행한 환경에서 사용

alter table public.clients
  add column if not exists deleted_id uuid references public.admins(id) on delete set null,
  add column if not exists deleted_at timestamptz;

create index if not exists clients_deleted_at_idx on public.clients (deleted_at);
