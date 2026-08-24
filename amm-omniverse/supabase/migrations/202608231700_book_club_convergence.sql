-- TRYAMM Kingdoms Press / Book Club convergence
-- Depends on public.publications from omniverse convergence.

create extension if not exists pgcrypto;

create table if not exists public.book_clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  visibility text not null default 'public' check (visibility in ('public','private')),
  category text not null default 'general',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_club_memberships (
  club_id uuid not null references public.book_clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','moderator','member')),
  joined_at timestamptz not null default now(),
  primary key (club_id,user_id)
);

create table if not exists public.book_club_selections (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.book_clubs(id) on delete cascade,
  publication_id uuid references public.publications(id) on delete set null,
  title text not null,
  status text not null default 'selected' check (status in ('nominated','selected','featured','completed','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.book_reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  publication_id uuid not null references public.publications(id) on delete cascade,
  club_id uuid references public.book_clubs(id) on delete set null,
  progress_percent numeric not null default 0 check (progress_percent between 0 and 100),
  current_location text not null default '',
  notes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id,publication_id,club_id)
);

create table if not exists public.book_club_discussions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.book_clubs(id) on delete cascade,
  publication_id uuid references public.publications(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.book_club_discussions(id) on delete cascade,
  body text not null,
  status text not null default 'visible' check (status in ('visible','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text not null default '',
  spoiler boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(publication_id,user_id)
);

alter table public.book_clubs enable row level security;
alter table public.book_club_memberships enable row level security;
alter table public.book_club_selections enable row level security;
alter table public.book_reading_progress enable row level security;
alter table public.book_club_discussions enable row level security;
alter table public.book_reviews enable row level security;

do $$ begin create policy "book clubs owners manage" on public.book_clubs for all using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid())); exception when duplicate_object then null; end $$;
do $$ begin create policy "book clubs readable" on public.book_clubs for select using (visibility='public' or owner_id=(select auth.uid()) or exists(select 1 from public.book_club_memberships m where m.club_id=book_clubs.id and m.user_id=(select auth.uid()))); exception when duplicate_object then null; end $$;

do $$ begin create policy "memberships readable" on public.book_club_memberships for select using (user_id=(select auth.uid()) or exists(select 1 from public.book_clubs c where c.id=book_club_memberships.club_id and c.owner_id=(select auth.uid()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "join public clubs" on public.book_club_memberships for insert with check (user_id=(select auth.uid()) and exists(select 1 from public.book_clubs c where c.id=book_club_memberships.club_id and c.visibility='public')); exception when duplicate_object then null; end $$;
do $$ begin create policy "leave own club" on public.book_club_memberships for delete using (user_id=(select auth.uid())); exception when duplicate_object then null; end $$;

do $$ begin create policy "club owner manages selections" on public.book_club_selections for all using (exists(select 1 from public.book_clubs c where c.id=book_club_selections.club_id and c.owner_id=(select auth.uid()))) with check (exists(select 1 from public.book_clubs c where c.id=book_club_selections.club_id and c.owner_id=(select auth.uid()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "selections readable" on public.book_club_selections for select using (exists(select 1 from public.book_clubs c where c.id=book_club_selections.club_id and (c.visibility='public' or c.owner_id=(select auth.uid()) or exists(select 1 from public.book_club_memberships m where m.club_id=c.id and m.user_id=(select auth.uid()))))); exception when duplicate_object then null; end $$;

do $$ begin create policy "users own reading progress" on public.book_reading_progress for all using (user_id=(select auth.uid())) with check (user_id=(select auth.uid())); exception when duplicate_object then null; end $$;

do $$ begin create policy "discussions readable in visible clubs" on public.book_club_discussions for select using (status='visible' and exists(select 1 from public.book_clubs c where c.id=book_club_discussions.club_id and (c.visibility='public' or c.owner_id=(select auth.uid()) or exists(select 1 from public.book_club_memberships m where m.club_id=c.id and m.user_id=(select auth.uid()))))); exception when duplicate_object then null; end $$;
drop policy if exists "members write discussions" on public.book_club_discussions;
create policy "members write discussions" on public.book_club_discussions for insert with check (
  user_id=(select auth.uid())
  and exists(
    select 1 from public.book_clubs c
    where c.id=book_club_discussions.club_id
      and (c.owner_id=(select auth.uid()) or exists(select 1 from public.book_club_memberships m where m.club_id=book_club_discussions.club_id and m.user_id=(select auth.uid())))
  )
);
do $$ begin create policy "users edit own discussions" on public.book_club_discussions for update using (user_id=(select auth.uid())) with check (user_id=(select auth.uid())); exception when duplicate_object then null; end $$;
do $$ begin create policy "users delete own discussions" on public.book_club_discussions for delete using (user_id=(select auth.uid())); exception when duplicate_object then null; end $$;

do $$ begin create policy "users manage own reviews" on public.book_reviews for all using (user_id=(select auth.uid())) with check (user_id=(select auth.uid())); exception when duplicate_object then null; end $$;
do $$ begin create policy "published reviews readable" on public.book_reviews for select using (user_id=(select auth.uid()) or exists(select 1 from public.publications p where p.id=book_reviews.publication_id and p.status='published')); exception when duplicate_object then null; end $$;

create index if not exists book_clubs_owner_idx on public.book_clubs(owner_id,updated_at desc);
create index if not exists book_club_discussions_club_idx on public.book_club_discussions(club_id,created_at desc);
create index if not exists book_club_selections_club_idx on public.book_club_selections(club_id,created_at desc);
create index if not exists book_reviews_publication_idx on public.book_reviews(publication_id,created_at desc);
