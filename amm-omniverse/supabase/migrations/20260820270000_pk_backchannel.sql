create table if not exists public.pk_backchannel_members (
  room_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  team text not null check (team in ('alpha','beta','host','moderator')),
  role text not null default 'player' check (role in ('player','captain','host','moderator')),
  display_name text not null default 'Player',
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key(room_id,user_id)
);

create table if not exists public.pk_backchannel_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('team-alpha','team-beta','hosts','moderators')),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists pk_backchannel_messages_room_created_idx on public.pk_backchannel_messages(room_id,created_at desc);
create index if not exists pk_backchannel_members_user_idx on public.pk_backchannel_members(user_id,room_id);

alter table public.pk_backchannel_members enable row level security;
alter table public.pk_backchannel_messages enable row level security;
revoke all on public.pk_backchannel_members from anon;
revoke all on public.pk_backchannel_messages from anon;

create policy "pk members read own room membership" on public.pk_backchannel_members for select to authenticated
using (user_id=(select auth.uid()) or exists(select 1 from public.pk_backchannel_members me where me.room_id=pk_backchannel_members.room_id and me.user_id=(select auth.uid()) and me.active=true));

create policy "pk users manage own membership" on public.pk_backchannel_members for all to authenticated
using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy "pk members read authorized channels" on public.pk_backchannel_messages for select to authenticated using (
 exists(select 1 from public.pk_backchannel_members me where me.room_id=pk_backchannel_messages.room_id and me.user_id=(select auth.uid()) and me.active=true and (
   (pk_backchannel_messages.channel='team-alpha' and me.team='alpha') or
   (pk_backchannel_messages.channel='team-beta' and me.team='beta') or
   (pk_backchannel_messages.channel='hosts' and me.role in ('host','captain','moderator')) or
   (pk_backchannel_messages.channel='moderators' and me.role='moderator')
 ))
);

create policy "pk members send authorized channels" on public.pk_backchannel_messages for insert to authenticated with check (
 sender_user_id=(select auth.uid()) and exists(select 1 from public.pk_backchannel_members me where me.room_id=pk_backchannel_messages.room_id and me.user_id=(select auth.uid()) and me.active=true and (
   (pk_backchannel_messages.channel='team-alpha' and me.team='alpha') or
   (pk_backchannel_messages.channel='team-beta' and me.team='beta') or
   (pk_backchannel_messages.channel='hosts' and me.role in ('host','captain','moderator')) or
   (pk_backchannel_messages.channel='moderators' and me.role='moderator')
 ))
);
