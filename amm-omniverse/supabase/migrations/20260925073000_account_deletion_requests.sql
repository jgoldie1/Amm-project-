create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'requested' check (status in ('requested','in_review','completed','cancelled')),
  source text not null default 'web-or-app',
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz null
);

alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from anon;
revoke all on public.account_deletion_requests from authenticated;
grant select, insert, update on public.account_deletion_requests to service_role;

create index if not exists account_deletion_requests_user_idx
  on public.account_deletion_requests(user_id,requested_at desc);

create unique index if not exists account_deletion_requests_one_open_per_user_idx
  on public.account_deletion_requests(user_id)
  where status in ('requested','in_review');
