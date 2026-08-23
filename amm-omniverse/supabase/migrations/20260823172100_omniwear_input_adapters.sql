create table if not exists public.omniwear_input_adapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.omniwear_devices(id) on delete cascade,
  adapter_type text not null check (adapter_type in ('eeg-bci','gaze','gesture','voice','switch','touch','motion','haptic','xr-controller','mobility-controller')),
  label text not null,
  enabled boolean not null default false,
  permissions jsonb not null default '{"navigation":false,"selection":false,"text_input":false,"world_control":false}'::jsonb,
  calibration jsonb not null default '{}'::jsonb,
  confidence_threshold numeric not null default 0.8 check (confidence_threshold between 0 and 1),
  safety_mode text not null default 'confirm' check (safety_mode in ('confirm','limited','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.omniwear_input_adapters enable row level security;
create policy "omniwear_input_adapters_owner_all" on public.omniwear_input_adapters for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
revoke all on public.omniwear_input_adapters from anon;
grant select,insert,update,delete on public.omniwear_input_adapters to authenticated;

create table if not exists public.omniwear_control_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  adapter_id uuid references public.omniwear_input_adapters(id) on delete cascade,
  intent text not null,
  confidence numeric check (confidence is null or confidence between 0 and 1),
  accepted boolean not null default false,
  target text,
  created_at timestamptz not null default now()
);
alter table public.omniwear_control_events enable row level security;
create policy "omniwear_control_events_owner_all" on public.omniwear_control_events for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
revoke all on public.omniwear_control_events from anon;
grant select,insert,delete on public.omniwear_control_events to authenticated;

update public.system_convergence_status set details = coalesce(details,'{}'::jsonb) || jsonb_build_object(
  'input_adapters',jsonb_build_array('eeg-bci','gaze','gesture','voice','switch','touch','motion','haptic','xr-controller','mobility-controller'),
  'bci_policy','noninvasive intent input only; no thought-reading claim; confirmation required for consequential actions',
  'wearable_types',jsonb_build_array('watch','band','ring','glasses','clothing','glove','vest','suit','mobility','sensor')
),checked_at=now(),updated_at=now() where service='omniwear';
