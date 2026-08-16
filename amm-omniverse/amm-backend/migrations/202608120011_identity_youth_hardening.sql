-- Holo Identity / youth safety hardening.
-- A user may read their identity profile, but age lane, credentials and permissions
-- must be controlled by trusted backend/guardian workflows, never direct client writes.

drop policy if exists "identity own row" on public.holo_identity_profiles;
drop policy if exists identity_own_row on public.holo_identity_profiles;

create policy "identity read own row"
on public.holo_identity_profiles for select
using (auth.uid() = user_id);

-- No authenticated insert/update/delete policy is intentionally created.
-- The service-role backend can manage these records because service role bypasses RLS.

-- Guardian relationships used by youth-facing education and platform controls.
create table if not exists public.guardian_relationships (
  id uuid primary key default gen_random_uuid(),
  guardian_user_id uuid not null references auth.users(id) on delete cascade,
  child_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','revoked')),
  permissions jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(guardian_user_id, child_user_id)
);

alter table public.guardian_relationships enable row level security;

create policy "guardian relationship participants read"
on public.guardian_relationships for select
using (auth.uid() = guardian_user_id or auth.uid() = child_user_id);

-- Direct client creation/update is intentionally disallowed; trusted backend verification only.

create index if not exists guardian_relationship_child_idx
  on public.guardian_relationships(child_user_id, status);
create index if not exists guardian_relationship_guardian_idx
  on public.guardian_relationships(guardian_user_id, status);
