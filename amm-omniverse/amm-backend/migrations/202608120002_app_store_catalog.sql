-- All American App Store catalog MVP
create table if not exists public.app_store_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text unique not null,
  name text not null,
  asset_type text not null,
  description text not null default '',
  price_cents integer not null default 0 check (price_cents >= 0),
  age_rating text not null default 'everyone',
  status text not null default 'draft' check (status in ('draft','review','approved','retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_store_assets enable row level security;
do $$ begin create policy "approved app store assets are public" on public.app_store_assets for select using (status = 'approved'); exception when duplicate_object then null; end $$;

insert into public.app_store_assets (asset_key,name,asset_type,description,price_cents,age_rating,status,metadata) values
('holo-c-wildlife-guide','Holo C Wildlife Guide','ai-agent','Identify and learn about simulated wildlife and ecosystems.',0,'everyone','approved','{"category":"wildlife"}'::jsonb),
('ai-call-center-trainer','AI Call Center Trainer','workforce','Practice customer service conversations and issue resolution.',0,'teen','approved','{"category":"workforce","simulation":"ai-call-center-v1"}'::jsonb),
('logistics-starter','Logistics Simulator Starter','workforce','Run the Chicago to Atlanta logistics training scenario.',0,'teen','approved','{"category":"workforce","simulation":"logistics-chicago-atlanta-v1"}'::jsonb),
('kingdoms-reader','Kingdoms Reader','book','Reader shell for Kingdoms Press publications and Living Books.',0,'everyone','approved','{"category":"books"}'::jsonb),
('creator-starter-kit','Creator Starter Kit','creator','Start an app, book, game, world, music or business project from AI Cafe.',0,'everyone','approved','{"category":"creator"}'::jsonb)
on conflict (asset_key) do update set name=excluded.name,description=excluded.description,status=excluded.status,metadata=excluded.metadata;
