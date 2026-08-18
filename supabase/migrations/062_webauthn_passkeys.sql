-- TRYAMM WebAuthn/passkey persistence. Server-only access via service role.
create table if not exists public.security_passkeys(
  credential_id text primary key,
  user_id text not null,
  webauthn_user_id text not null,
  public_key_b64 text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  device_type text,
  backed_up boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  label text
);
create index if not exists security_passkeys_user_idx on public.security_passkeys(user_id, created_at desc);
alter table public.security_passkeys enable row level security;

create table if not exists public.security_webauthn_challenges(
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id text not null,
  purpose text not null check (purpose in ('registration','authentication','step-up')),
  challenge text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists security_webauthn_challenges_lookup_idx on public.security_webauthn_challenges(user_id,session_id,purpose,expires_at desc);
alter table public.security_webauthn_challenges enable row level security;

revoke all on table public.security_passkeys from anon, authenticated;
revoke all on table public.security_webauthn_challenges from anon, authenticated;
