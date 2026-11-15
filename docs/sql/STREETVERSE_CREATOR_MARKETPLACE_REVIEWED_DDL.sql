-- StreetVerse Creator Marketplace: review before applying to connected Supabase.
-- Run in an isolated staging database and verify SELECT/INSERT/UPDATE/DELETE with RLS.
-- No payments, cash-out, real purchase orders or wallet balances are created here.
create table if not exists public.streetverse_creator_listings (
 id text primary key check (id ~ '^[a-z0-9-]{3,64}$'),
 creator_user_id uuid not null references auth.users(id) on delete cascade,
 category text not null check (category in ('clothing','hair','building','mission','animation')),
 title text not null check (char_length(trim(title)) between 1 and 80),
 description text not null default '' check (char_length(description)<=500),
 asset_path text not null check (asset_path ~ '^/assets/mods/[A-Za-z0-9/_-]+\.(glb|json)$' and position('..' in asset_path)=0),
 license text not null check (license in ('original','licensed')),
 rights_confirmed boolean not null default false check (rights_confirmed),
 triangle_count integer not null check (triangle_count between 0 and 30000),
 texture_bytes integer not null check (texture_bytes between 0 and 2000000),
 reward_credits integer not null default 0 check (reward_credits between 0 and 250),
 price_credits integer not null check (price_credits between 1 and 10000),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 reviewer_user_id uuid references auth.users(id),
 review_notes text check (review_notes is null or char_length(review_notes)<=2000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint review_attestation check ((status='pending' and reviewer_user_id is null) or (status<>'pending' and reviewer_user_id is not null and char_length(trim(coalesce(review_notes,'')))>0))
);
create index if not exists streetverse_creator_listings_public_idx on public.streetverse_creator_listings(status,created_at desc);
create index if not exists streetverse_creator_listings_creator_idx on public.streetverse_creator_listings(creator_user_id,created_at desc);
alter table public.streetverse_creator_listings enable row level security;
revoke all on public.streetverse_creator_listings from anon,authenticated;
grant select on public.streetverse_creator_listings to anon,authenticated;
grant insert,update on public.streetverse_creator_listings to authenticated;
-- Moderators are assigned by privileged server administration in raw_app_meta_data, never user_metadata.
drop policy if exists streetverse_creator_public_read on public.streetverse_creator_listings;
create policy streetverse_creator_public_read on public.streetverse_creator_listings for select to anon,authenticated
 using (status='approved');
drop policy if exists streetverse_creator_creator_read on public.streetverse_creator_listings;
create policy streetverse_creator_creator_read on public.streetverse_creator_listings for select to authenticated
 using (creator_user_id=(select auth.uid()));
drop policy if exists streetverse_creator_moderator_read on public.streetverse_creator_listings;
create policy streetverse_creator_moderator_read on public.streetverse_creator_listings for select to authenticated
 using ((select auth.jwt())->'app_metadata'->>'streetverse_role'='moderator');
drop policy if exists streetverse_creator_creator_insert on public.streetverse_creator_listings;
create policy streetverse_creator_creator_insert on public.streetverse_creator_listings for insert to authenticated
 with check (creator_user_id=(select auth.uid()) and status='pending' and reviewer_user_id is null);
drop policy if exists streetverse_creator_moderator_update on public.streetverse_creator_listings;
create policy streetverse_creator_moderator_update on public.streetverse_creator_listings for update to authenticated
 using ((select auth.jwt())->'app_metadata'->>'streetverse_role'='moderator' and creator_user_id<>(select auth.uid()) and status='pending')
 with check ((select auth.jwt())->'app_metadata'->>'streetverse_role'='moderator' and creator_user_id<>(select auth.uid()) and reviewer_user_id=(select auth.uid()) and status in ('approved','rejected'));
create or replace function public.streetverse_guard_creator_listing()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  if new.status<>'pending' or new.reviewer_user_id is not null or new.review_notes is not null then raise exception 'New creator submissions must be pending'; end if;
  new.created_at=now();new.updated_at=now();
 elsif TG_OP='UPDATE' then
  if old.status<>'pending' or new.status not in ('approved','rejected') then raise exception 'Only one pending review decision is allowed'; end if;
  if new.creator_user_id=(select auth.uid()) or new.reviewer_user_id is distinct from (select auth.uid()) then raise exception 'Independent authenticated reviewer required'; end if;
  if (to_jsonb(new)-array['status','reviewer_user_id','review_notes','updated_at']) is distinct from (to_jsonb(old)-array['status','reviewer_user_id','review_notes','updated_at']) then
   raise exception 'Review cannot change creator assets or pricing';
  end if;
  new.updated_at=now();
 end if;
 return new;
end $$;
revoke all on function public.streetverse_guard_creator_listing() from public;
drop trigger if exists streetverse_guard_creator_listing_trigger on public.streetverse_creator_listings;
create trigger streetverse_guard_creator_listing_trigger
 before insert or update on public.streetverse_creator_listings
 for each row execute function public.streetverse_guard_creator_listing();
-- Server operators must assign moderator role using trusted app_metadata.
-- Never grant browser access to service_role. Do not enable real-money payments through this table.
