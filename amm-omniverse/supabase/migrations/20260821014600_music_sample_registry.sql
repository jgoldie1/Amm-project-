create table if not exists public.music_sample_submissions (
 id uuid primary key default gen_random_uuid(), track_id text not null, user_id uuid not null references auth.users(id) on delete cascade,
 sample_start_ms bigint not null check(sample_start_ms>=0), sample_end_ms bigint not null check(sample_end_ms>sample_start_ms), source_type text not null, rights_claim text not null,
 territories text[] not null default '{}'::text[], evidence_refs jsonb not null default '[]'::jsonb, audio_hash text, fingerprint_id text,
 state text not null default 'draft' check(state in ('draft','submitted','fingerprinting','possible-match','clearance-needed','cleared','rejected','disputed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.music_sample_matches (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.music_sample_submissions(id) on delete cascade,
 detector text not null, candidate_ref text, confidence numeric check(confidence is null or(confidence>=0 and confidence<=1)),
 signal text not null check(signal in ('no-signal','possible-match','strong-match','manual-review-required')), metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.music_sample_clearances (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.music_sample_submissions(id) on delete cascade,
 master_rights_state text not null default 'pending', composition_rights_state text not null default 'pending', permitted_media text[] not null default '{}'::text[],
 monetization_allowed boolean not null default false, attribution_required text, revenue_share_bps integer check(revenue_share_bps is null or(revenue_share_bps>=0 and revenue_share_bps<=10000)),
 document_refs jsonb not null default '[]'::jsonb, reviewer_user_id uuid references auth.users(id), reviewed_at timestamptz);
alter table public.music_sample_submissions enable row level security; alter table public.music_sample_matches enable row level security; alter table public.music_sample_clearances enable row level security;
revoke all on public.music_sample_submissions from anon; revoke all on public.music_sample_matches from anon; revoke all on public.music_sample_clearances from anon;
create policy "sample owner read" on public.music_sample_submissions for select to authenticated using ((select auth.uid())=user_id);
create policy "sample owner create" on public.music_sample_submissions for insert to authenticated with check ((select auth.uid())=user_id);
create policy "sample owner draft update" on public.music_sample_submissions for update to authenticated using ((select auth.uid())=user_id and state='draft') with check ((select auth.uid())=user_id);
create policy "sample owner reads matches" on public.music_sample_matches for select to authenticated using (exists(select 1 from public.music_sample_submissions s where s.id=submission_id and s.user_id=(select auth.uid())));
create policy "sample owner reads clearance" on public.music_sample_clearances for select to authenticated using (exists(select 1 from public.music_sample_submissions s where s.id=submission_id and s.user_id=(select auth.uid())));
-- Detector writes and clearance decisions are trusted-server/admin operations only.
