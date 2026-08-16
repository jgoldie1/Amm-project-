-- Secure LiveKit room ownership/membership model.
create table if not exists public.live_rooms (
  room_key text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  visibility text not null default 'public' check (visibility in ('public','private')),
  youth_mode boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_room_members (
  room_key text not null references public.live_rooms(room_key) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','cohost','speaker','moderator','viewer')),
  status text not null default 'active' check (status in ('invited','active','blocked')),
  created_at timestamptz not null default now(),
  primary key(room_key,user_id)
);

alter table public.live_rooms enable row level security;
alter table public.live_room_members enable row level security;

create policy "live rooms public or participant read"
on public.live_rooms for select
using (
  visibility='public'
  or owner_user_id=auth.uid()
  or exists(select 1 from public.live_room_members m where m.room_key=live_rooms.room_key and m.user_id=auth.uid() and m.status='active')
);

create policy "live room members own membership read"
on public.live_room_members for select
using (user_id=auth.uid());

-- Creation/membership mutation remains backend service-role only so roles cannot be self-promoted.
create index if not exists live_room_members_user_idx on public.live_room_members(user_id,status);
