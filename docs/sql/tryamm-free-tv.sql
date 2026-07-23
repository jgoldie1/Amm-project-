-- TryAMM Free TV persistence foundation (Supabase/Postgres)
create extension if not exists pgcrypto;

create table if not exists free_tv_titles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  type text not null,
  title text not null,
  description text default '',
  lane text not null default 'general',
  status text not null default 'draft',
  territories jsonb not null default '["US"]'::jsonb,
  monetization text not null default 'AVOD',
  assets jsonb not null default '{}'::jsonb,
  rights jsonb not null default '{}'::jsonb,
  review jsonb not null default '{}'::jsonb,
  publish jsonb not null default '{"eligible":false,"reasons":[]}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists free_tv_watchlist (
  user_id uuid not null,
  title_id uuid not null references free_tv_titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,title_id)
);

create table if not exists free_tv_watch_progress (
  user_id uuid not null,
  title_id uuid not null references free_tv_titles(id) on delete cascade,
  position_seconds numeric not null default 0,
  duration_seconds numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id,title_id)
);

create table if not exists free_tv_channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  name text not null,
  lane text not null default 'general',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists free_tv_channel_schedule (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references free_tv_channels(id) on delete cascade,
  title_id uuid references free_tv_titles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  ad_marker_policy jsonb not null default '{}'::jsonb,
  territory_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists free_tv_rights_documents (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references free_tv_titles(id) on delete cascade,
  kind text not null,
  status text not null default 'submitted',
  storage_path text,
  expires_at timestamptz,
  reviewed_by uuid,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table free_tv_titles enable row level security;
alter table free_tv_watchlist enable row level security;
alter table free_tv_watch_progress enable row level security;
alter table free_tv_channels enable row level security;
alter table free_tv_channel_schedule enable row level security;
alter table free_tv_rights_documents enable row level security;

create policy "published titles readable" on free_tv_titles for select using (status='published' or owner_id=auth.uid());
create policy "owners manage draft titles" on free_tv_titles for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "users manage watchlist" on free_tv_watchlist for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "users manage progress" on free_tv_watch_progress for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "channel owners manage channels" on free_tv_channels for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "published schedule readable" on free_tv_channel_schedule for select using (true);
create policy "title owners view rights docs" on free_tv_rights_documents for select using (exists(select 1 from free_tv_titles t where t.id=title_id and t.owner_id=auth.uid()));

-- Production note: trusted service-role/admin workflows should perform rights-review status changes,
-- technical-QC approvals, moderation approvals, publish actions, ad accounting and payouts.
