create table if not exists public.omniwear_assistive_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mobility_goals jsonb not null default '{}'::jsonb,
  cue_preferences jsonb not null default '{"haptic":true,"audio":true,"visual":true}'::jsonb,
  assistance_limits jsonb not null default '{"max_session_minutes":30,"requires_confirmation":true}'::jsonb,
  clinician_mode boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.omniwear_haptic_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  body_zone text not null,
  pattern jsonb not null,
  purpose text not null check (purpose in ('navigation','balance-cue','gait-cue','reach-cue','posture-cue','xr-feedback','game-feedback','accessibility')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.omniwear_assistive_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.omniwear_devices(id) on delete set null,
  session_type text not null check (session_type in ('gait-training','balance-training','upper-limb-training','navigation','adl-training','simulation')),
  intent_source text not null default 'manual' check (intent_source in ('manual','gesture','gaze','voice','switch','motion','eeg-bci')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  safety_state text not null default 'confirm' check (safety_state in ('confirm','active','paused','blocked')),
  session_data jsonb not null default '{}'::jsonb
);
alter table public.omniwear_assistive_profiles enable row level security;
alter table public.omniwear_haptic_patterns enable row level security;
alter table public.omniwear_assistive_sessions enable row level security;
create policy "omniwear_assistive_profiles_owner_all" on public.omniwear_assistive_profiles for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "omniwear_haptic_patterns_owner_all" on public.omniwear_haptic_patterns for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "omniwear_assistive_sessions_owner_all" on public.omniwear_assistive_sessions for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
revoke all on public.omniwear_assistive_profiles, public.omniwear_haptic_patterns, public.omniwear_assistive_sessions from anon;
grant select,insert,update,delete on public.omniwear_assistive_profiles, public.omniwear_haptic_patterns, public.omniwear_assistive_sessions to authenticated;
update public.system_convergence_status set details=coalesce(details,'{}'::jsonb) || jsonb_build_object(
  'quantum_haptic_suit','assistive accessibility/training architecture ready',
  'mobility_support',jsonb_build_array('gait-cues','balance-cues','posture-cues','navigation','upper-limb-cues','xr-feedback'),
  'medical_boundary','no diagnosis/treatment/restoration claims without validated hardware and clinical/regulatory evidence'
),checked_at=now(),updated_at=now() where service='omniwear';
