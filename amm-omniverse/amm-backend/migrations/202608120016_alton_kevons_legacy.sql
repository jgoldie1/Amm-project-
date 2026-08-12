create extension if not exists pgcrypto;

create table if not exists public.family_legacy_profiles (
  legacy_key text primary key,
  display_name text not null,
  description text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_legacy_projects (
  id uuid primary key default gen_random_uuid(),
  legacy_key text not null references public.family_legacy_profiles(legacy_key) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  project_type text not null default 'general',
  status text not null default 'idea' check (status in ('idea','planning','building','testing','active','completed','archived')),
  data jsonb not null default '{}'::jsonb,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_legacy_assets (
  id uuid primary key default gen_random_uuid(),
  legacy_key text not null references public.family_legacy_profiles(legacy_key) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null,
  title text not null,
  asset_url text,
  rights_status text not null default 'owner-asserted',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.family_legacy_profiles enable row level security;
alter table public.family_legacy_projects enable row level security;
alter table public.family_legacy_assets enable row level security;

create policy "family legacy profiles readable" on public.family_legacy_profiles for select using(active=true);
create policy "family legacy projects own" on public.family_legacy_projects for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "family legacy assets own" on public.family_legacy_assets for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());

insert into public.family_legacy_profiles(legacy_key,display_name,description,metadata) values
('jacobie','Jacobie Vision','Cybersecurity, real estate, land and home flipping, business and technology pathways','{"existingVerticals":["cybersecurity","real-estate"]}'::jsonb),
('isaiah','Isaiah AI / Starverse','Isaiah AI TV, Anyone Can Be A Star, auditions, showcases, films, sports and creator media','{"existingVerticals":["starverse","ai-tv"]}'::jsonb),
('aniyah','Aniyah Studio / Pay','64-track DAW, vocal AI, mix/master support and cross-border payment architecture','{"existingVerticals":["music","cross-border-payments"]}'::jsonb),
('alton','Alton Legacy','Flexible family legacy lane for Alton projects, businesses, education, media, technology and investments','{"status":"ready-for-specialization"}'::jsonb),
('kevons','Kevons Legacy','Flexible family legacy lane for Kevons projects, businesses, education, media, technology and investments','{"status":"ready-for-specialization"}'::jsonb)
on conflict(legacy_key) do update set display_name=excluded.display_name,description=excluded.description,metadata=excluded.metadata,updated_at=now();