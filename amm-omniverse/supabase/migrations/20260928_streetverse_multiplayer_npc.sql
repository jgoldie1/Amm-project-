-- StreetVerse multiplayer/NPC foundation.
-- Local game coordinates are Cartesian world units, not WGS84 longitude/latitude.
create table if not exists public.streetverse_world_objects (
  id uuid primary key default gen_random_uuid(),
  object_type text not null check (object_type in ('vehicle','property_door','prop','npc')),
  owner_id uuid references auth.users(id) on delete set null,
  x double precision not null default 0,
  y double precision not null default 0,
  z double precision not null default 0,
  rotation jsonb not null default '{"x":0,"y":0,"z":0,"w":1}'::jsonb,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists streetverse_world_objects_xz_idx on public.streetverse_world_objects (x,z);

create table if not exists public.streetverse_npc_affinity (
  player_id uuid not null references auth.users(id) on delete cascade,
  npc_id text not null,
  romance_score integer not null default 0 check (romance_score between 0 and 100),
  trust_score integer not null default 0 check (trust_score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key(player_id,npc_id)
);

create table if not exists public.streetverse_tip_intents (
  id uuid primary key,
  player_id uuid not null references auth.users(id) on delete cascade,
  npc_id text not null,
  amount bigint not null check(amount > 0),
  room_id text not null,
  status text not null default 'pending' check(status in ('pending','settled','rejected')),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

alter table public.streetverse_world_objects enable row level security;
alter table public.streetverse_npc_affinity enable row level security;
alter table public.streetverse_tip_intents enable row level security;

create policy "world objects readable" on public.streetverse_world_objects for select using (true);
create policy "own affinity readable" on public.streetverse_npc_affinity for select using (auth.uid()=player_id);
create policy "own tip receipts readable" on public.streetverse_tip_intents for select using (auth.uid()=player_id);

-- Money movement remains server-authoritative. Do not grant clients execute rights
-- to wallet/ledger settlement functions; route through the existing verified payment/ledger service.
