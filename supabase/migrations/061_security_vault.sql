-- TRYAMM security vault: persistent MFA, step-up authorizations, account lockdown and security audit.

create table if not exists public.security_mfa_profiles(
  user_id text primary key,
  enabled boolean not null default false,
  methods text[] not null default '{}',
  totp_secret_ciphertext text,
  totp_secret_iv text,
  totp_secret_tag text,
  recovery_code_hashes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.security_mfa_profiles enable row level security;

create table if not exists public.security_stepup_challenges(
  id text primary key,
  token_hash text not null unique,
  user_id text not null,
  session_id text not null,
  action text not null,
  method text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);
create index if not exists security_stepup_lookup_idx on public.security_stepup_challenges(user_id,session_id,action,expires_at desc);
alter table public.security_stepup_challenges enable row level security;

create table if not exists public.security_account_state(
  user_id text primary key,
  locked boolean not null default false,
  locked_at timestamptz,
  locked_reason text,
  payout_frozen boolean not null default false,
  api_keys_frozen boolean not null default false,
  recovery_required boolean not null default false,
  payout_change_pending_until timestamptz,
  payout_change_destination_hash text,
  updated_at timestamptz not null default now()
);
alter table public.security_account_state enable row level security;

create table if not exists public.security_audit_events(
  id uuid primary key default gen_random_uuid(),
  user_id text,
  actor_id text,
  session_id text,
  event_type text not null,
  severity text not null default 'info' check(severity in ('info','warning','high','critical')),
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists security_audit_user_idx on public.security_audit_events(user_id,created_at desc);
alter table public.security_audit_events enable row level security;

revoke all on table public.security_mfa_profiles from anon, authenticated;
revoke all on table public.security_stepup_challenges from anon, authenticated;
revoke all on table public.security_account_state from anon, authenticated;
revoke all on table public.security_audit_events from anon, authenticated;
