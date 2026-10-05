-- Metaverse Bible / Time Machine Pass 5 production evidence.
-- Browser observations may be submitted, but only internally verified evidence can satisfy
-- production release gates.

create table if not exists public.tryamm_bible_world_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  release_key text,
  asset_id text,
  evidence_type text not null check (evidence_type in (
    'provider-artifact',
    'collision',
    'navigation',
    'mobile-performance',
    'accessibility',
    'human-visual-review'
  )),
  state text not null default 'submitted' check (state in ('submitted','verified','rejected','superseded')),
  source text not null,
  reference text not null,
  artifact_url text,
  artifact_sha256 text,
  metrics jsonb not null default '{}'::jsonb,
  notes text not null default '',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by text
);

create index if not exists tryamm_bible_world_evidence_plan_idx
  on public.tryamm_bible_world_evidence(user_id,plan_id,state,evidence_type,created_at desc);
create index if not exists tryamm_bible_world_evidence_asset_idx
  on public.tryamm_bible_world_evidence(user_id,plan_id,asset_id,evidence_type,state);

alter table public.tryamm_bible_world_evidence enable row level security;
revoke insert,update,delete on public.tryamm_bible_world_evidence from anon,authenticated;
grant select on public.tryamm_bible_world_evidence to authenticated;

drop policy if exists tryamm_bible_world_evidence_read_own on public.tryamm_bible_world_evidence;
create policy tryamm_bible_world_evidence_read_own on public.tryamm_bible_world_evidence
for select to authenticated
using ((select auth.uid())=user_id);

comment on table public.tryamm_bible_world_evidence is
'Pass 5 evidence for Metaverse Bible / Time Machine world promotion. Client submissions never equal verification. Only server-verified evidence can satisfy production release gates.';
