create table if not exists public.streetverse_legacy_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_key text not null,
  evidence_type text not null,
  storage_path text,
  external_reference text,
  note text not null default '',
  verification_state text not null default 'submitted' check (verification_state in ('submitted','reviewing','supported','inconclusive','rejected','rights-cleared')),
  rights_scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.streetverse_legacy_evidence enable row level security;
revoke all on table public.streetverse_legacy_evidence from anon;
grant select, insert, update, delete on table public.streetverse_legacy_evidence to authenticated;

drop policy if exists "legacy evidence owner read" on public.streetverse_legacy_evidence;
drop policy if exists "legacy evidence owner insert" on public.streetverse_legacy_evidence;
drop policy if exists "legacy evidence owner update" on public.streetverse_legacy_evidence;
drop policy if exists "legacy evidence owner delete" on public.streetverse_legacy_evidence;
create policy "legacy evidence owner read" on public.streetverse_legacy_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy "legacy evidence owner insert" on public.streetverse_legacy_evidence for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "legacy evidence owner update" on public.streetverse_legacy_evidence for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "legacy evidence owner delete" on public.streetverse_legacy_evidence for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.streetverse_legacy_evidence is 'Private evidence/rights metadata for player-authored legacy memories. Raw copyrighted media belongs in private storage, not public tables.';
