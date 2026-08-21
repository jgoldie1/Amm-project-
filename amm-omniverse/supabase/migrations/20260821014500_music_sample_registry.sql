create table if not exists public.music_sample_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null,
  uses_sample boolean not null default false,
  source_title text,
  source_artist text,
  sample_start_ms integer check (sample_start_ms is null or sample_start_ms >= 0),
  sample_duration_ms integer check (sample_duration_ms is null or sample_duration_ms > 0),
  master_owner text,
  composition_owner text,
  territories text[] not null default '{}'::text[],
  allowed_uses text[] not null default '{}'::text[],
  term_start date,
  term_end date,
  status text not null default 'declared' check (status in ('declared','detected-review','clearance-pending','cleared','rejected','original-no-sample')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_sample_detection_events (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.music_sample_registrations(id) on delete cascade,
  detector text not null,
  match_type text not null,
  confidence numeric,
  candidate_reference text,
  result text not null default 'review',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.music_sample_clearance_evidence (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.music_sample_registrations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence_type text not null,
  storage_ref text not null,
  issuer text,
  effective_at timestamptz,
  expires_at timestamptz,
  review_state text not null default 'pending' check (review_state in ('pending','accepted','rejected','expired')),
  created_at timestamptz not null default now()
);

alter table public.music_sample_registrations enable row level security;
alter table public.music_sample_detection_events enable row level security;
alter table public.music_sample_clearance_evidence enable row level security;
revoke all on public.music_sample_registrations from anon;
revoke all on public.music_sample_detection_events from anon;
revoke all on public.music_sample_clearance_evidence from anon;

create policy "creator reads own sample registrations" on public.music_sample_registrations for select to authenticated using ((select auth.uid()) = user_id);
create policy "creator creates own sample registrations" on public.music_sample_registrations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "creator reads own clearance evidence" on public.music_sample_clearance_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy "creator submits own clearance evidence" on public.music_sample_clearance_evidence for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "creator reads detection events for own registrations" on public.music_sample_detection_events for select to authenticated using (exists (select 1 from public.music_sample_registrations r where r.id=registration_id and r.user_id=(select auth.uid())));

-- Status approval, automated detection writes and evidence acceptance/rejection are server/reviewer controlled.
-- No client policy grants direct commercial clearance.
