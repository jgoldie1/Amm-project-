create table if not exists public.aau_course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  module_id text not null,
  status text not null default 'not-started' check(status in ('not-started','in-progress','submitted','passed','needs-revision','completed')),
  score numeric,
  evidence jsonb not null default '{}'::jsonb,
  immersive_mission_id text,
  updated_at timestamptz not null default now(),
  unique(user_id,course_id,module_id)
);
create table if not exists public.aau_learning_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  evidence_type text not null check(evidence_type in ('assignment','exam','lab','immersive-mission','gameverse-mission','portfolio','attendance','faculty-review')),
  source_ref text,
  artifact_refs jsonb not null default '[]'::jsonb,
  verified boolean not null default false,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.aau_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  credential_type text not null check(credential_type in ('completion-badge','certificate','microcredential','degree-candidate-record','workforce-badge')),
  status text not null default 'pending' check(status in ('pending','eligible','issued','revoked')),
  requirements_snapshot jsonb not null default '{}'::jsonb,
  evidence_ids uuid[] not null default '{}'::uuid[],
  issued_at timestamptz,
  issuer_ref text,
  created_at timestamptz not null default now()
);
alter table public.aau_course_progress enable row level security;
alter table public.aau_learning_evidence enable row level security;
alter table public.aau_credentials enable row level security;
revoke all on public.aau_course_progress from anon;
revoke all on public.aau_learning_evidence from anon;
revoke all on public.aau_credentials from anon;
create policy "student reads own progress" on public.aau_course_progress for select to authenticated using((select auth.uid())=user_id);
create policy "student writes own progress" on public.aau_course_progress for insert to authenticated with check((select auth.uid())=user_id);
create policy "student updates own progress" on public.aau_course_progress for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "student reads own evidence" on public.aau_learning_evidence for select to authenticated using((select auth.uid())=user_id);
create policy "student submits own evidence" on public.aau_learning_evidence for insert to authenticated with check((select auth.uid())=user_id and verified=false and verified_by is null);
create policy "student reads own credentials" on public.aau_credentials for select to authenticated using((select auth.uid())=user_id);
-- Faculty/admin verification and credential issuance remain trusted-server/admin operations only.
-- Nothing in this schema represents accreditation, licensure, or government recognition by itself.
