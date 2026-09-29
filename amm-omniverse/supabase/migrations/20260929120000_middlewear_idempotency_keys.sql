create table if not exists public.middlewear_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  operation text not null,
  key_hash text not null,
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, operation, key_hash)
);

alter table public.middlewear_idempotency_keys enable row level security;
revoke all on table public.middlewear_idempotency_keys from anon, authenticated;
create index if not exists middlewear_idempotency_keys_expires_at_idx on public.middlewear_idempotency_keys(expires_at);
create index if not exists middlewear_idempotency_keys_user_operation_idx on public.middlewear_idempotency_keys(user_id, operation);

comment on table public.middlewear_idempotency_keys is
'Backend-only MiddleWear idempotency locks. Raw client idempotency keys are never stored; only hashes are persisted.';
