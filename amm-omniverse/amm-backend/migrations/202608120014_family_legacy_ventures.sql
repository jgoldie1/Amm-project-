create extension if not exists pgcrypto;

create table if not exists public.jacobie_cyber_projects (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, project_type text not null check (project_type in ('security-audit','training-lab','threat-model','incident-simulation','privacy-review','compliance-readiness','cyber-range')),
  status text not null default 'draft' check (status in ('draft','active','review','completed','archived')),
  risk_level text not null default 'low' check (risk_level in ('low','medium','high','critical')),
  scope jsonb not null default '{}'::jsonb, findings jsonb not null default '[]'::jsonb, remediation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.jacobie_real_estate_projects (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_type text not null check (project_type in ('land','single-family','multi-family','commercial','flip','rental','development','wholesale-simulation')),
  title text not null, market text, status text not null default 'analysis' check (status in ('analysis','due-diligence','acquisition-planning','renovation','listed','rental','completed','archived')),
  purchase_price numeric, rehab_budget numeric, after_repair_value numeric, carrying_cost numeric, projected_rent numeric,
  assumptions jsonb not null default '{}'::jsonb, due_diligence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.starverse_links (
  user_id uuid primary key references auth.users(id) on delete cascade, starverse_profile_ref text,
  talent_categories text[] not null default '{}', youth_guardian_required boolean not null default false,
  integration_status text not null default 'linked' check (integration_status in ('pending','linked','suspended','revoked')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.aniyah_audio_projects (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, sample_rate integer not null default 48000, bit_depth integer not null default 24, tempo numeric,
  time_signature text not null default '4/4', track_limit integer not null default 64 check (track_limit between 1 and 64),
  status text not null default 'recording' check (status in ('recording','editing','mixing','mastering','released','archived')),
  project_state jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.aniyah_audio_tracks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.aniyah_audio_projects(id) on delete cascade,
  track_number integer not null check (track_number between 1 and 64), name text not null,
  track_type text not null default 'audio' check (track_type in ('audio','midi','instrument','bus','aux','master')),
  audio_url text, gain_db numeric not null default 0, pan numeric not null default 0 check (pan between -1 and 1), muted boolean not null default false, solo boolean not null default false,
  inserts jsonb not null default '[]'::jsonb, sends jsonb not null default '[]'::jsonb, automation jsonb not null default '{}'::jsonb,
  unique(project_id,track_number)
);

create table if not exists public.aniyah_vocal_coach_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.aniyah_audio_projects(id) on delete set null,
  session_type text not null check (session_type in ('pitch','timing','breath','tone','range','delivery','harmony','performance','mix-feedback','mastering-feedback')),
  source_audio_url text, analysis jsonb not null default '{}'::jsonb, recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aniyah_crossborder_quotes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, source_currency text not null, destination_currency text not null, source_amount numeric not null check (source_amount>0),
  destination_amount numeric, exchange_rate numeric, provider_fee numeric, platform_fee numeric not null default 0,
  expires_at timestamptz, status text not null default 'quoted' check (status in ('quoted','expired','selected','cancelled')),
  provider_quote_ref text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.aniyah_crossborder_transfers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid references public.aniyah_crossborder_quotes(id) on delete set null, provider text not null, provider_transfer_ref text,
  source_currency text not null, destination_currency text not null, source_amount numeric not null check (source_amount>0), destination_amount numeric,
  status text not null default 'requires_compliance' check (status in ('requires_compliance','requires_confirmation','submitted','processing','paid','failed','cancelled','refunded')),
  compliance_status text not null default 'not_started' check (compliance_status in ('not_started','pending','approved','rejected','manual_review')),
  recipient_reference text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.plugin_registry (
  plugin_key text primary key, name text not null, category text not null,
  runtime text not null check (runtime in ('server','browser','worker','external-adapter','audio-worklet')),
  status text not null default 'disabled' check (status in ('disabled','sandbox','enabled','suspended','retired')),
  version text not null default '0.1.0', permissions text[] not null default '{}', allowed_domains text[] not null default '{}',
  config_schema jsonb not null default '{}'::jsonb, capabilities text[] not null default '{}',
  requires_human_confirmation boolean not null default false, youth_allowed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.plugin_installations (
  id uuid primary key default gen_random_uuid(), plugin_key text not null references public.plugin_registry(plugin_key) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade, scope text not null default 'user', status text not null default 'active',
  settings jsonb not null default '{}'::jsonb, last_health_check timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.plugin_audit_events (
  id uuid primary key default gen_random_uuid(), plugin_key text not null, user_id uuid references auth.users(id) on delete set null,
  action text not null, result text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

alter table public.jacobie_cyber_projects enable row level security;
alter table public.jacobie_real_estate_projects enable row level security;
alter table public.starverse_links enable row level security;
alter table public.aniyah_audio_projects enable row level security;
alter table public.aniyah_audio_tracks enable row level security;
alter table public.aniyah_vocal_coach_sessions enable row level security;
alter table public.aniyah_crossborder_quotes enable row level security;
alter table public.aniyah_crossborder_transfers enable row level security;
alter table public.plugin_registry enable row level security;
alter table public.plugin_installations enable row level security;
alter table public.plugin_audit_events enable row level security;

create policy "jacobie cyber own" on public.jacobie_cyber_projects for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie realestate own" on public.jacobie_real_estate_projects for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "starverse link own" on public.starverse_links for select using(user_id=auth.uid());
create policy "aniyah projects own" on public.aniyah_audio_projects for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "aniyah tracks through project" on public.aniyah_audio_tracks for all using(exists(select 1 from public.aniyah_audio_projects p where p.id=project_id and p.owner_user_id=auth.uid())) with check(exists(select 1 from public.aniyah_audio_projects p where p.id=project_id and p.owner_user_id=auth.uid()));
create policy "aniyah coach own" on public.aniyah_vocal_coach_sessions for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "aniyah quote own" on public.aniyah_crossborder_quotes for select using(user_id=auth.uid());
create policy "aniyah transfer own" on public.aniyah_crossborder_transfers for select using(user_id=auth.uid());
create policy "plugins readable enabled" on public.plugin_registry for select using(status in ('sandbox','enabled'));
create policy "plugin installs own" on public.plugin_installations for select using(owner_user_id=auth.uid());

insert into public.plugin_registry(plugin_key,name,category,runtime,status,permissions,capabilities,requires_human_confirmation,youth_allowed) values
('aniyah.pitch','Aniyah Pitch & Auto-Tune','audio','audio-worklet','sandbox',array['audio.read','audio.process'],array['pitch-detect','pitch-correct','scale-lock'],false,true),
('aniyah.vocal-coach','Aniyah AI Vocal Coach','audio-ai','server','sandbox',array['audio.read','ai.infer'],array['pitch','timing','breath','tone','range','delivery','harmony'],false,true),
('aniyah.mix-assist','Aniyah Mix/Master Assist','audio-ai','server','sandbox',array['audio.read','ai.infer'],array['gain-staging','eq-advice','compression-advice','stereo','loudness'],false,true),
('aniyah.crossborder','Aniyah Cross-Border Provider Adapter','payments','external-adapter','disabled',array['payments.quote','payments.submit','compliance.read'],array['fx-quote','recipient-validation','transfer-status'],true,false),
('jacobie.cyber-scan','Jacobie Vision Security Scanner','cybersecurity','worker','sandbox',array['security.scan'],array['dependency-scan','headers','configuration-review','threat-model'],false,true),
('jacobie.realestate-data','Jacobie Vision Real Estate Data Adapter','real-estate','external-adapter','disabled',array['property.read'],array['comps','tax','parcel','listing','rent-estimate'],false,false),
('isaiah.starverse','Isaiah AI Starverse Connector','media','external-adapter','sandbox',array['profile.read','showcase.read','audition.submit'],array['auditions','voting','shows','casting','isaiah-ai-tv'],true,true)
on conflict(plugin_key) do nothing;