-- Advanced Living Worlds vertical-slice schema
-- Adds real persistent runtimes for space, chrono, biosphere, AI Cafe operations,
-- Generations World and city districts without claiming a planet-scale AAA asset build.

create table if not exists public.celestial_bodies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  body_type text not null check (body_type in ('planet','moon','station','asteroid')),
  parent_slug text,
  gravity numeric not null,
  atmosphere text not null default 'none',
  temperature_c numeric,
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.space_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_slug text not null references public.celestial_bodies(slug),
  mission_type text not null default 'exploration',
  status text not null default 'planned' check (status in ('planned','active','completed','aborted')),
  fuel integer not null default 100 check (fuel between 0 and 100),
  oxygen integer not null default 100 check (oxygen between 0 and 100),
  supplies integer not null default 100 check (supplies between 0 and 100),
  science integer not null default 0 check (science >= 0),
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.chrono_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  era text not null,
  scenario_type text not null check (scenario_type in ('historical-reconstruction','future-simulation','alternate','personal-timeline')),
  evidence_level text not null check (evidence_level in ('documented','reconstructed','speculative','fictional')),
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.chrono_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.chrono_scenarios(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','aborted')),
  state jsonb not null default '{}'::jsonb,
  score integer check (score between 0 and 100),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.species_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  common_name text not null,
  category text not null check (category in ('mammal','bird','fish','reptile','amphibian','insect','arachnid','marine','plant','fungus')),
  habitat text[] not null default '{}',
  diet text[] not null default '{}',
  conservation text not null default 'not-evaluated',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.wildlife_populations (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species_catalog(id) on delete cascade,
  region_key text not null,
  estimated_population integer not null default 0 check (estimated_population >= 0),
  health_score integer not null default 100 check (health_score between 0 and 100),
  migration_state text not null default 'resident',
  updated_at timestamptz not null default now(),
  unique(species_id, region_key)
);

create table if not exists public.wilderness_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('photography','tracking','fishing','hunting-simulation','conservation','marine-research')),
  region_key text not null default 'worldwide-1',
  status text not null default 'active' check (status in ('active','completed','aborted')),
  conservation_score integer not null default 0,
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.cafe_locations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  format text not null default 'digital-twin',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.cafe_inventory (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafe_locations(id) on delete cascade,
  item_key text not null,
  name text not null,
  category text not null,
  quantity numeric not null default 0,
  reorder_level numeric not null default 0,
  unit_cost numeric not null default 0,
  sell_price numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique(cafe_id,item_key)
);

create table if not exists public.cafe_shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cafe_id uuid not null references public.cafe_locations(id) on delete cascade,
  role text not null default 'creator-table',
  status text not null default 'active' check (status in ('active','completed')),
  orders_completed integer not null default 0,
  waste_score integer not null default 100,
  customer_score integer not null default 100,
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.generations_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age_lane text not null default 'adult' check (age_lane in ('child','teen','young-adult','adult','mentor')),
  guardian_required boolean not null default false,
  skill_tree jsonb not null default '{}'::jsonb,
  legacy_goals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.generations_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pathway text not null,
  level integer not null default 1 check (level > 0),
  xp integer not null default 0 check (xp >= 0),
  milestones jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id,pathway)
);

create table if not exists public.city_districts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city_key text not null,
  district_type text not null,
  crime_enabled boolean not null default false,
  economy jsonb not null default '{}'::jsonb,
  services jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.city_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  district_id uuid not null references public.city_districts(id) on delete cascade,
  activity_key text not null,
  path text not null check (path in ('street','life-city','kingdom','business','creator','service')),
  status text not null default 'active' check (status in ('active','completed','failed')),
  reputation_delta integer not null default 0,
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.celestial_bodies enable row level security;
alter table public.space_missions enable row level security;
alter table public.chrono_scenarios enable row level security;
alter table public.chrono_runs enable row level security;
alter table public.species_catalog enable row level security;
alter table public.wildlife_populations enable row level security;
alter table public.wilderness_runs enable row level security;
alter table public.cafe_locations enable row level security;
alter table public.cafe_inventory enable row level security;
alter table public.cafe_shifts enable row level security;
alter table public.generations_profiles enable row level security;
alter table public.generations_progress enable row level security;
alter table public.city_districts enable row level security;
alter table public.city_activities enable row level security;

create policy "public read celestial bodies" on public.celestial_bodies for select using (true);
create policy "users manage own space missions" on public.space_missions for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "public read chrono scenarios" on public.chrono_scenarios for select using (true);
create policy "users manage own chrono runs" on public.chrono_runs for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "public read species" on public.species_catalog for select using (true);
create policy "public read wildlife populations" on public.wildlife_populations for select using (true);
create policy "users manage own wilderness runs" on public.wilderness_runs for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "public read cafe locations" on public.cafe_locations for select using (true);
create policy "public read cafe inventory" on public.cafe_inventory for select using (true);
create policy "users manage own cafe shifts" on public.cafe_shifts for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users manage own generations profile" on public.generations_profiles for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users manage own generations progress" on public.generations_progress for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "public read city districts" on public.city_districts for select using (true);
create policy "users manage own city activities" on public.city_activities for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

insert into public.celestial_bodies(slug,name,body_type,parent_slug,gravity,atmosphere,temperature_c,description) values
('earth','Earth','planet',null,1.0,'nitrogen-oxygen',15,'Home world and global civilization simulation.'),
('moon','Moon','moon','earth',0.165,'trace-exosphere',-20,'Low-gravity exploration, science, construction and logistics.'),
('mars','Mars','planet',null,0.38,'thin-co2',-63,'Settlement, water, power, agriculture and exploration simulation.'),
('saturn','Saturn','planet',null,1.065,'hydrogen-helium',-178,'Orbital science and ring-system exploration.'),
('titan','Titan','moon','saturn',0.138,'nitrogen-methane',-179,'Atmosphere, hydrocarbon lakes, drones and extreme-environment research.'),
('enceladus','Enceladus','moon','saturn',0.011,'trace-water-vapor',-201,'Ice, plume and subsurface-ocean science concepts.')
on conflict(slug) do update set name=excluded.name,gravity=excluded.gravity,atmosphere=excluded.atmosphere,temperature_c=excluded.temperature_c,description=excluded.description;

insert into public.chrono_scenarios(slug,name,era,scenario_type,evidence_level,description) values
('ancient-city-study','Ancient City Study','ancient','historical-reconstruction','reconstructed','Source-labeled educational reconstruction with documented and inferred elements separated.'),
('industrial-transition','Industrial Transition','1800s','historical-reconstruction','documented','Explore labor, manufacturing, logistics and urban growth using source-conscious reconstruction.'),
('future-green-city','Future Green City','future','future-simulation','speculative','Model energy, mobility, food, housing and climate assumptions without presenting them as predictions.'),
('alternate-logistics','Alternate Logistics Timeline','alternate','alternate','fictional','What-if supply-chain and city-economy sandbox.')
on conflict(slug) do nothing;

insert into public.species_catalog(slug,common_name,category,habitat,diet,conservation) values
('honey-bee','Honey Bee','insect',array['garden','farm','forest-edge'],array['nectar','pollen'],'managed'),
('monarch-butterfly','Monarch Butterfly','insect',array['meadow','garden'],array['nectar'],'monitor'),
('orb-weaver','Orb Weaver Spider','arachnid',array['garden','forest'],array['insects'],'stable'),
('red-tailed-hawk','Red-tailed Hawk','bird',array['city-edge','grassland','forest'],array['small-mammals'],'stable'),
('largemouth-bass','Largemouth Bass','fish',array['lake','river'],array['fish','invertebrates'],'managed'),
('white-tailed-deer','White-tailed Deer','mammal',array['forest','grassland'],array['plants'],'managed'),
('gray-wolf','Gray Wolf','mammal',array['forest','tundra'],array['mammals'],'protected-regional'),
('bottlenose-dolphin','Bottlenose Dolphin','marine',array['coast','ocean'],array['fish','squid'],'monitor')
on conflict(slug) do nothing;

insert into public.cafe_locations(slug,name,city,format) values
('ai-cafe-chicago-digital','AI Café Chicago Digital Twin','Chicago','digital-twin')
on conflict(slug) do nothing;

insert into public.cafe_inventory(cafe_id,item_key,name,category,quantity,reorder_level,unit_cost,sell_price)
select id,'free-market-coffee','Free Market Coffee','coffee',120,30,0.75,4.50 from public.cafe_locations where slug='ai-cafe-chicago-digital'
on conflict(cafe_id,item_key) do update set name=excluded.name;

insert into public.cafe_inventory(cafe_id,item_key,name,category,quantity,reorder_level,unit_cost,sell_price)
select id,'earth-breakfast','Earth Kitchen Breakfast','food',60,15,3.50,11.00 from public.cafe_locations where slug='ai-cafe-chicago-digital'
on conflict(cafe_id,item_key) do update set name=excluded.name;

insert into public.city_districts(slug,name,city_key,district_type,crime_enabled,economy,services) values
('amm-downtown','AMM Downtown','global-city-01','mixed',true,'{"jobs":1000,"businesses":240}'::jsonb,'{"transit":true,"hospital":true,"academy":true}'::jsonb),
('kingdom-quarter','Kingdom Quarter','global-city-01','faith-community',false,'{"jobs":300,"businesses":60}'::jsonb,'{"kingdom_academy":true,"storehouse":true}'::jsonb),
('generations-district','Generations District','global-city-01','family-education',false,'{"jobs":200,"businesses":40}'::jsonb,'{"school":true,"sports":true,"creator_lab":true}'::jsonb),
('creator-district','Creator District','global-city-01','creator-business',false,'{"jobs":800,"businesses":300}'::jsonb,'{"studio":true,"app_store":true,"kingdoms_press":true}'::jsonb)
on conflict(slug) do nothing;
