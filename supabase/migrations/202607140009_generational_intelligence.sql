create table if not exists public.ai_generation_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  generation text not null check (generation in ('genx','millennial','genz','genalpha')),
  language text not null default 'en',
  response_length text not null default 'medium',
  interests jsonb not null default '[]'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  personalization_consent boolean not null default false,
  parental_consent boolean,
  is_minor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_adaptation_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  generation text not null,
  task text not null,
  routes jsonb not null default '[]'::jsonb,
  requires_confirmation boolean not null default false,
  response_evaluation jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_generation_profiles enable row level security;
alter table public.ai_adaptation_sessions enable row level security;

create policy "owners manage generation profile" on public.ai_generation_profiles for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners view adaptation sessions" on public.ai_adaptation_sessions for select using (auth.uid()=owner_id);
create policy "owners create adaptation sessions" on public.ai_adaptation_sessions for insert with check (auth.uid()=owner_id);

create index if not exists ai_adaptation_sessions_owner_created_idx on public.ai_adaptation_sessions(owner_id,created_at desc);
