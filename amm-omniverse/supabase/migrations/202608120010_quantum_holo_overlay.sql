-- Quantumverse Holographic Overlay: missions, rewards, gifts, progression, and safe monetization.
-- Real-money checkout remains server-side through Holo Pay / Stripe. No randomized paid loot boxes.

create table if not exists public.quantum_player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  xp bigint not null default 0 check (xp >= 0),
  earned_credits bigint not null default 0 check (earned_credits >= 0),
  reputation jsonb not null default '{}'::jsonb,
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quantum_mission_catalog (
  id uuid primary key default gen_random_uuid(),
  mission_key text unique not null,
  title text not null,
  description text not null default '',
  lane text not null,
  minimum_age_lane text not null default 'child',
  mission_type text not null default 'dynamic',
  xp_reward integer not null default 0 check (xp_reward >= 0),
  credit_reward integer not null default 0 check (credit_reward >= 0),
  reward_payload jsonb not null default '{}'::jsonb,
  objectives jsonb not null default '[]'::jsonb,
  repeatable boolean not null default true,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quantum_player_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.quantum_mission_catalog(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','claimed','abandoned')),
  progress jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  claimed_at timestamptz,
  unique(user_id, mission_id, started_at)
);

create table if not exists public.quantum_reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_id text,
  reward_type text not null,
  amount numeric(18,4) not null default 0,
  item_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.quantum_gift_catalog (
  id uuid primary key default gen_random_uuid(),
  gift_key text unique not null,
  name text not null,
  description text not null default '',
  gift_type text not null default 'cosmetic',
  rarity text not null default 'common',
  earnable boolean not null default true,
  purchasable boolean not null default false,
  price_cents integer check (price_cents is null or price_cents >= 0),
  age_rating text not null default 'E',
  asset_ref text,
  creator_user_id uuid references auth.users(id) on delete set null,
  creator_share_bps integer not null default 0 check (creator_share_bps between 0 and 10000),
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.quantum_player_gifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gift_id uuid not null references public.quantum_gift_catalog(id) on delete cascade,
  source text not null default 'earned',
  quantity integer not null default 1 check (quantity > 0),
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  unique(user_id, gift_id, source)
);

create table if not exists public.quantum_achievements (
  id uuid primary key default gen_random_uuid(),
  achievement_key text unique not null,
  name text not null,
  description text not null default '',
  icon_ref text,
  xp_reward integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.quantum_player_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.quantum_achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key(user_id, achievement_id)
);

alter table public.quantum_player_progress enable row level security;
alter table public.quantum_player_missions enable row level security;
alter table public.quantum_reward_ledger enable row level security;
alter table public.quantum_player_gifts enable row level security;
alter table public.quantum_player_achievements enable row level security;
alter table public.quantum_mission_catalog enable row level security;
alter table public.quantum_gift_catalog enable row level security;
alter table public.quantum_achievements enable row level security;

create policy if not exists q_progress_read_own on public.quantum_player_progress for select using (auth.uid() = user_id);
create policy if not exists q_progress_insert_own on public.quantum_player_progress for insert with check (auth.uid() = user_id);
create policy if not exists q_missions_read_own on public.quantum_player_missions for select using (auth.uid() = user_id);
create policy if not exists q_rewards_read_own on public.quantum_reward_ledger for select using (auth.uid() = user_id);
create policy if not exists q_gifts_read_own on public.quantum_player_gifts for select using (auth.uid() = user_id);
create policy if not exists q_achievements_read_own on public.quantum_player_achievements for select using (auth.uid() = user_id);
create policy if not exists q_mission_catalog_read on public.quantum_mission_catalog for select using (enabled = true);
create policy if not exists q_gift_catalog_read on public.quantum_gift_catalog for select using (enabled = true);
create policy if not exists q_achievement_catalog_read on public.quantum_achievements for select using (enabled = true);

insert into public.quantum_mission_catalog (mission_key,title,description,lane,minimum_age_lane,xp_reward,credit_reward,objectives,repeatable)
values
('welcome-city','Welcome to the Living City','Meet HoloGPT, visit AI Cafe, and complete your first neighborhood objective.','life-city','child',250,100,'[{"key":"meet-hologpt","label":"Meet HoloGPT"},{"key":"visit-ai-cafe","label":"Visit AI Cafe"},{"key":"complete-task","label":"Complete one task"}]'::jsonb,false),
('logistics-run','Holo Logistics Run','Deliver a simulated shipment safely and on time.','business','tween',350,180,'[{"key":"pickup","label":"Pick up shipment"},{"key":"route","label":"Choose route"},{"key":"deliver","label":"Complete delivery"}]'::jsonb,true),
('wildlife-guardian','Wildlife Guardian','Observe wildlife and complete a conservation activity.','wilderness','child',300,120,'[{"key":"identify","label":"Identify species"},{"key":"observe","label":"Record observation"},{"key":"protect","label":"Complete conservation action"}]'::jsonb,true),
('creator-first-release','First Creator Release','Finish and publish an approved creator project.','creator','teen',500,250,'[{"key":"create","label":"Create project"},{"key":"review","label":"Pass review"},{"key":"publish","label":"Publish"}]'::jsonb,false)
on conflict (mission_key) do nothing;

insert into public.quantum_gift_catalog (gift_key,name,description,gift_type,rarity,earnable,purchasable,price_cents,age_rating,creator_share_bps)
values
('holo-crown-starter','Holo Crown','Earned holographic profile crown.','cosmetic','rare',true,false,null,'E',0),
('creator-stage-aura','Creator Stage Aura','Visual creator-stage holographic aura.','cosmetic','epic',true,true,499,'E10+',7000),
('quantum-city-skin','Quantum City HUD Skin','Alternate holographic interface theme.','cosmetic','legendary',false,true,699,'E10+',0)
on conflict (gift_key) do nothing;
