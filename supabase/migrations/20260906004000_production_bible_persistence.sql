create table if not exists public.production_bibles (
  production_id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  format text not null,
  content_lane text not null default 'general',
  version integer not null default 1,
  bible jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint production_bibles_format_allowed check (format in ('reel','episode','feature-30','feature-60','feature-90','feature-120')),
  constraint production_bibles_lane_allowed check (content_lane in ('general','g','pg','pg-13','r','after-dark')),
  constraint production_bibles_version_positive check (version > 0)
);

create index if not exists production_bibles_owner_updated_idx
  on public.production_bibles(owner_user_id, updated_at desc);

alter table public.production_bibles enable row level security;
revoke all on table public.production_bibles from anon, authenticated;
grant select, insert, update, delete on table public.production_bibles to authenticated;

drop policy if exists "Production Bible owner read" on public.production_bibles;
create policy "Production Bible owner read"
  on public.production_bibles for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists "Production Bible owner insert" on public.production_bibles;
create policy "Production Bible owner insert"
  on public.production_bibles for insert to authenticated
  with check (owner_user_id = auth.uid());

drop policy if exists "Production Bible owner update" on public.production_bibles;
create policy "Production Bible owner update"
  on public.production_bibles for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Production Bible owner delete" on public.production_bibles;
create policy "Production Bible owner delete"
  on public.production_bibles for delete to authenticated
  using (owner_user_id = auth.uid());

create or replace function public.set_production_bible_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists production_bibles_set_updated_at on public.production_bibles;
create trigger production_bibles_set_updated_at
before update on public.production_bibles
for each row execute function public.set_production_bible_updated_at();

create table if not exists public.production_placement_events (
  event_id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.production_bibles(production_id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  placement_id text not null,
  event_type text not null,
  territory text not null,
  viewer_session_hash text,
  commerce_reference text,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint production_placement_event_type_allowed check (event_type in ('IMPRESSION','INTERACTION','OMNI_BOX_SAVE','CHECKOUT_STARTED','PURCHASE_VERIFIED'))
);

create index if not exists production_placement_events_production_created_idx
  on public.production_placement_events(production_id, created_at desc);

alter table public.production_placement_events enable row level security;
revoke all on table public.production_placement_events from public, anon, authenticated;
grant select on table public.production_placement_events to authenticated;

drop policy if exists "Production placement event owner read" on public.production_placement_events;
create policy "Production placement event owner read"
  on public.production_placement_events for select to authenticated
  using (owner_user_id = auth.uid());

create or replace function public.record_production_placement_event(
  p_production_id uuid,
  p_owner_user_id uuid,
  p_placement_id text,
  p_event_type text,
  p_territory text,
  p_viewer_session_hash text default null,
  p_commerce_reference text default null,
  p_event_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  if p_event_type not in ('IMPRESSION','INTERACTION','OMNI_BOX_SAVE','CHECKOUT_STARTED','PURCHASE_VERIFIED') then
    raise exception 'invalid_production_placement_event_type';
  end if;
  if not exists (
    select 1 from public.production_bibles
    where production_id = p_production_id and owner_user_id = p_owner_user_id
  ) then
    raise exception 'production_bible_owner_mismatch';
  end if;
  insert into public.production_placement_events(
    production_id,owner_user_id,placement_id,event_type,territory,viewer_session_hash,commerce_reference,event_metadata
  ) values (
    p_production_id,p_owner_user_id,trim(p_placement_id),p_event_type,trim(p_territory),nullif(trim(coalesce(p_viewer_session_hash,'')),''),nullif(trim(coalesce(p_commerce_reference,'')),''),coalesce(p_event_metadata,'{}'::jsonb)
  ) returning event_id into v_event_id;
  return v_event_id;
end;
$$;

revoke all on function public.record_production_placement_event(uuid,uuid,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.record_production_placement_event(uuid,uuid,text,text,text,text,text,jsonb) to service_role;

comment on table public.production_bibles is 'Owner-scoped TRYAMM Production Bible persistence. Stores creative metadata and continuity state; it is not authoritative for payment or settlement.';
comment on table public.production_placement_events is 'Read-only-to-client attribution projection. Events are written by trusted server paths only.';
comment on function public.record_production_placement_event(uuid,uuid,text,text,text,text,text,jsonb) is 'Trusted-server-only placement attribution recorder. PURCHASE_VERIFIED must be emitted only after authoritative payment verification.';
