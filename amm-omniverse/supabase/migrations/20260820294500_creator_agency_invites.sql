create extension if not exists pgcrypto;

create table if not exists public.tryamm_agencies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  markets text[] not null default '{}',
  specialties text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','active','suspended','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tryamm_agency_memberships (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.tryamm_agencies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','recruiter','coach','creator','moderator','analyst')),
  status text not null default 'active' check (status in ('invited','active','paused','left','removed')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (agency_id,user_id)
);

create table if not exists public.tryamm_creator_invites (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.tryamm_agencies(id) on delete cascade,
  inviter_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  source_platform text not null default 'other' check (source_platform in ('tiktok','bigo','twitch','youtube','instagram','facebook','kick','other')),
  campaign text,
  max_uses integer check (max_uses is null or max_uses > 0),
  uses integer not null default 0 check (uses >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tryamm_creator_attribution (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invite_id uuid not null references public.tryamm_creator_invites(id) on delete restrict,
  agency_id uuid references public.tryamm_agencies(id) on delete set null,
  source_platform text not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_tryamm_agencies_owner on public.tryamm_agencies(owner_user_id);
create index if not exists idx_tryamm_memberships_user on public.tryamm_agency_memberships(user_id);
create index if not exists idx_tryamm_memberships_agency on public.tryamm_agency_memberships(agency_id);
create index if not exists idx_tryamm_invites_agency on public.tryamm_creator_invites(agency_id);
create index if not exists idx_tryamm_invites_inviter on public.tryamm_creator_invites(inviter_user_id);
create index if not exists idx_tryamm_attribution_agency on public.tryamm_creator_attribution(agency_id);

alter table public.tryamm_agencies enable row level security;
alter table public.tryamm_agency_memberships enable row level security;
alter table public.tryamm_creator_invites enable row level security;
alter table public.tryamm_creator_attribution enable row level security;

revoke all on public.tryamm_agencies from anon;
revoke all on public.tryamm_agency_memberships from anon;
revoke all on public.tryamm_creator_invites from anon;
revoke all on public.tryamm_creator_attribution from anon;

grant select,insert,update on public.tryamm_agencies to authenticated;
grant select,insert,update on public.tryamm_agency_memberships to authenticated;
grant select,insert,update on public.tryamm_creator_invites to authenticated;
grant select,insert on public.tryamm_creator_attribution to authenticated;

create policy "agency owner select" on public.tryamm_agencies for select to authenticated
using (owner_user_id = (select auth.uid()) or exists (
  select 1 from public.tryamm_agency_memberships m where m.agency_id=id and m.user_id=(select auth.uid()) and m.status='active'
));
create policy "agency owner insert" on public.tryamm_agencies for insert to authenticated with check (owner_user_id=(select auth.uid()));
create policy "agency owner update" on public.tryamm_agencies for update to authenticated using (owner_user_id=(select auth.uid())) with check (owner_user_id=(select auth.uid()));

create policy "membership visible to self or agency owner" on public.tryamm_agency_memberships for select to authenticated
using (user_id=(select auth.uid()) or exists (select 1 from public.tryamm_agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));
create policy "agency owner manages memberships" on public.tryamm_agency_memberships for insert to authenticated
with check (exists (select 1 from public.tryamm_agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));
create policy "agency owner updates memberships" on public.tryamm_agency_memberships for update to authenticated
using (exists (select 1 from public.tryamm_agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));

create policy "invite visible to owner or member" on public.tryamm_creator_invites for select to authenticated
using (inviter_user_id=(select auth.uid()) or agency_id is null or exists (select 1 from public.tryamm_agency_memberships m where m.agency_id=tryamm_creator_invites.agency_id and m.user_id=(select auth.uid()) and m.status='active'));
create policy "invite creator insert own" on public.tryamm_creator_invites for insert to authenticated
with check (inviter_user_id=(select auth.uid()) and (agency_id is null or exists (select 1 from public.tryamm_agency_memberships m where m.agency_id=tryamm_creator_invites.agency_id and m.user_id=(select auth.uid()) and m.role in ('owner','manager','recruiter') and m.status='active')));
create policy "invite owner update" on public.tryamm_creator_invites for update to authenticated using (inviter_user_id=(select auth.uid()));

create policy "attribution self select" on public.tryamm_creator_attribution for select to authenticated using (user_id=(select auth.uid()));
create policy "attribution self insert" on public.tryamm_creator_attribution for insert to authenticated with check (user_id=(select auth.uid()));

comment on table public.tryamm_creator_attribution is 'Immutable first-touch creator/agency attribution. Reward eligibility is resolved separately by server-side programs; attribution alone never creates money, employment, ownership or guaranteed earnings.';
