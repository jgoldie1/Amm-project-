create type age_band as enum ('CHILD','TEEN','ADULT');
create type moderation_action_type as enum ('WARN','MUTE','KICK','SUSPEND','BAN','TERMINATE_LIVE','REMOVE_CONTENT');

alter table if exists profiles add column if not exists date_of_birth date;
alter table if exists profiles add column if not exists age_band age_band;
alter table if exists profiles add column if not exists guardian_consent_at timestamptz;
alter table if exists profiles add column if not exists age_verified_at timestamptz;

create table if not exists safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  details text,
  status text not null default 'OPEN',
  created_at timestamptz not null default now()
);

create table if not exists user_blocks (
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists user_mutes (
  muter_id uuid not null,
  muted_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id)
);

create table if not exists account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'PENDING',
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null,
  target_type text not null,
  target_id text not null,
  action moderation_action_type not null,
  duration_minutes integer,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists live_room_safety (
  room_id uuid primary key,
  min_age integer not null default 13 check (min_age in (0,13,18)),
  mature boolean not null default false,
  moderation_enabled boolean not null default true
);

create index if not exists safety_reports_status_idx on safety_reports(status, created_at desc);
create index if not exists moderation_actions_target_idx on moderation_actions(target_type, target_id, created_at desc);
