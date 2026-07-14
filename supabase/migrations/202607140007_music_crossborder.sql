create table if not exists public.music_studio_projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null, track_capacity integer not null default 64 check (track_capacity between 1 and 128),
  sample_rate integer not null default 48000, bit_depth integer not null default 24, tempo numeric not null default 120,
  musical_key text, buses jsonb not null default '[]'::jsonb, status text not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.music_streaming_releases (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.music_studio_projects(id) on delete set null, title text not null, artist_name text not null,
  audio_master_url text, video_url text, cover_url text, rights_confirmed boolean not null default false,
  explicit boolean not null default false, territories jsonb not null default '[]'::jsonb,
  status text not null default 'draft', created_at timestamptz not null default now()
);
create table if not exists public.crossborder_recipients (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null, display_name text not null, country text not null, currency text not null,
  payout_method text, provider_recipient_reference text, status text not null default 'pending-verification',
  created_at timestamptz not null default now()
);
create table if not exists public.crossborder_transfers (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references public.crossborder_recipients(id) on delete set null, from_country text not null,
  to_country text not null, source_currency text not null, destination_currency text not null,
  source_amount numeric(20,4) not null check (source_amount > 0), purpose text not null,
  provider text not null, provider_reference text, status text not null default 'compliance-review',
  escrow_required boolean not null default false, travel_rule_data_required boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.music_studio_projects enable row level security;
alter table public.music_streaming_releases enable row level security;
alter table public.crossborder_recipients enable row level security;
alter table public.crossborder_transfers enable row level security;
create policy "owners manage music projects" on public.music_studio_projects for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage music releases" on public.music_streaming_releases for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage crossborder recipients" on public.crossborder_recipients for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage crossborder transfers" on public.crossborder_transfers for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create index if not exists music_projects_owner_idx on public.music_studio_projects(owner_id,created_at desc);
create index if not exists music_releases_owner_idx on public.music_streaming_releases(owner_id,created_at desc);
create index if not exists crossborder_recipients_owner_idx on public.crossborder_recipients(owner_id,created_at desc);
create index if not exists crossborder_transfers_owner_idx on public.crossborder_transfers(owner_id,created_at desc);