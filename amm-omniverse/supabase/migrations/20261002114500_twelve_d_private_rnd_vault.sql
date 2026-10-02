-- Private 12D R&D vault.
-- The schema can live in the public source tree, but R&D contents are service-role only.
-- No public/anon/authenticated table privileges are granted.

create table if not exists public.twelve_d_rnd_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  status text not null default 'private-draft'
    check (status in ('private-draft','private-review','private-validated','archived')),
  publication_state text not null default 'private'
    check (publication_state in ('private','approved-for-publication')),
  summary text,
  private_notes text,
  evidence jsonb not null default '{}'::jsonb,
  publication_approval jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists twelve_d_rnd_records_owner_updated_idx
  on public.twelve_d_rnd_records(owner_user_id,updated_at desc);
create index if not exists twelve_d_rnd_records_publication_idx
  on public.twelve_d_rnd_records(publication_state,status,updated_at desc);

alter table public.twelve_d_rnd_records enable row level security;
revoke all on table public.twelve_d_rnd_records from public, anon, authenticated;
grant select,insert,update,delete on table public.twelve_d_rnd_records to service_role;

comment on table public.twelve_d_rnd_records is
'Private TRYAMM 12D R&D notes. Never expose through a public manifest or anonymous client query. Public release requires a separate explicit publication step not implemented by this table.';
