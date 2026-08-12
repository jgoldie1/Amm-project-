-- Omni Box: deterministic/disclosed reward bundles for Quantumverse holographic overlay.
-- No paid randomized loot boxes. Youth accounts may receive earned/guardian-approved boxes only.

create table if not exists public.omni_box_catalog (
  id uuid primary key default gen_random_uuid(),
  box_key text unique not null,
  name text not null,
  description text not null default '',
  box_type text not null default 'mission' check (box_type in ('mission','event','creator','member','promotional','education','legacy')),
  rarity text not null default 'common',
  contents jsonb not null default '[]'::jsonb,
  contents_disclosed boolean not null default true,
  deterministic boolean not null default true,
  earnable boolean not null default true,
  purchasable boolean not null default false,
  guardian_approval_required boolean not null default false,
  minimum_age_lane text not null default 'child',
  price_cents integer check (price_cents is null or price_cents >= 0),
  creator_user_id uuid references auth.users(id) on delete set null,
  creator_share_bps integer not null default 0 check (creator_share_bps between 0 and 10000),
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint omni_box_safe_purchase check (not purchasable or (deterministic and contents_disclosed and price_cents is not null))
);

create table if not exists public.omni_player_boxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  box_id uuid not null references public.omni_box_catalog(id) on delete cascade,
  source_type text not null default 'earned',
  source_id text,
  status text not null default 'unopened' check (status in ('unopened','opened','expired')),
  granted_at timestamptz not null default now(),
  opened_at timestamptz,
  resolved_contents jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.omni_box_catalog enable row level security;
alter table public.omni_player_boxes enable row level security;

create policy if not exists omni_box_catalog_read on public.omni_box_catalog for select using (enabled = true);
create policy if not exists omni_player_boxes_read_own on public.omni_player_boxes for select using (auth.uid() = user_id);

insert into public.omni_box_catalog
(box_key,name,description,box_type,rarity,contents,earnable,purchasable,guardian_approval_required,minimum_age_lane,price_cents,creator_share_bps)
values
('welcome-omni-box','Welcome Omni Box','A disclosed starter reward for completing the Living City welcome mission.','mission','rare','[{"type":"earned_credits","amount":150},{"type":"gift","gift_key":"holo-crown-starter"}]'::jsonb,true,false,false,'child',null,0),
('academy-omni-box','Academy Omni Box','Education milestone bundle with study cosmetics and earned credits.','education','rare','[{"type":"earned_credits","amount":100},{"type":"badge","key":"academy-starter"}]'::jsonb,true,false,false,'child',null,0),
('creator-omni-box','Creator Omni Box','Fixed creator support bundle. Contents are shown before purchase.','creator','epic','[{"type":"gift","gift_key":"creator-stage-aura"},{"type":"creator_tool_credit","amount":1}]'::jsonb,true,true,true,'teen',499,7000),
('member-omni-box','Member Omni Box','Fixed member cosmetic bundle. No random contents.','member','legendary','[{"type":"gift","gift_key":"quantum-city-skin"},{"type":"badge","key":"member-holo"}]'::jsonb,false,true,true,'teen',699,0)
on conflict (box_key) do nothing;
