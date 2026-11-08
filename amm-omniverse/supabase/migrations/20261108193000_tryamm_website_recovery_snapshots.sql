-- TRYAMM Quantum Cloud: low-cost, user-private website-builder recovery.
-- Additive migration. Never alters existing site, payments, DNS or other tables.
create table if not exists public.tryamm_site_recovery_snapshots (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 reason text not null check (char_length(reason) between 1 and 80),
 fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
 payload jsonb not null,
 created_at timestamptz not null default now(),
 constraint tryamm_site_recovery_payload_format check (
  payload ->> 'schema' = 'tryamm.website.vault.v1'
  and jsonb_typeof(payload -> 'sites') = 'array'
  and jsonb_typeof(payload -> 'trash') = 'array'
  and jsonb_typeof(payload -> 'versions') = 'array'
  and jsonb_array_length(payload -> 'sites') <= 250
  and jsonb_array_length(payload -> 'trash') <= 200
  and jsonb_array_length(payload -> 'versions') <= 250
 ),
 constraint tryamm_site_recovery_payload_limit check (octet_length(payload::text) <= 256000),
 unique(owner_id,fingerprint)
);
create index if not exists tryamm_site_recovery_owner_latest
 on public.tryamm_site_recovery_snapshots(owner_id,created_at desc,id desc);

alter table public.tryamm_site_recovery_snapshots enable row level security;
revoke all on public.tryamm_site_recovery_snapshots from anon,authenticated;
grant select on public.tryamm_site_recovery_snapshots to authenticated;
grant insert (owner_id,reason,fingerprint,payload)
 on public.tryamm_site_recovery_snapshots to authenticated;

drop policy if exists tryamm_recovery_read_own on public.tryamm_site_recovery_snapshots;
create policy tryamm_recovery_read_own
 on public.tryamm_site_recovery_snapshots for select to authenticated
 using (owner_id = (select auth.uid()));

drop policy if exists tryamm_recovery_insert_own on public.tryamm_site_recovery_snapshots;
create policy tryamm_recovery_insert_own
 on public.tryamm_site_recovery_snapshots for insert to authenticated
 with check (owner_id = (select auth.uid()));

-- Database-managed retention prevents unbounded storage growth.
-- Client has no UPDATE/DELETE permissions; most recent 40 backups are retained.
create or replace function public.tryamm_recovery_keep_last_40()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
 delete from public.tryamm_site_recovery_snapshots
 where id in (
  select older.id from public.tryamm_site_recovery_snapshots older
  where older.owner_id = new.owner_id
  order by older.created_at desc,older.id desc
  offset 40
 );
 return null;
end;
$$;
revoke all on function public.tryamm_recovery_keep_last_40() from public,anon,authenticated;
drop trigger if exists tryamm_recovery_retention on public.tryamm_site_recovery_snapshots;
create trigger tryamm_recovery_retention
 after insert on public.tryamm_site_recovery_snapshots
 for each row execute function public.tryamm_recovery_keep_last_40();

comment on table public.tryamm_site_recovery_snapshots is
 'Private, size-limited TRYAMM website-builder snapshots. Most recent 40 per authenticated owner; no client update/delete; not a full hosting/database/DNS backup.';
